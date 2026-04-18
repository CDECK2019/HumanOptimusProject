import { pb } from './pocketbase';
import { UserProfile, Symptom, Intervention, Goal, Biometrics, Lab, type Tier } from '../types';
import type { HealthIntake } from '../intakeTypes';
import { computeReadiness } from '../utils/readinessScore';
import { loadDevProfile, persistDevProfile, useLocalDevProfile } from './authBypass';

export class DataService {

    // Get or Create the current active snapshot for the user
    static async getActiveSnapshot(): Promise<UserProfile> {
        if (useLocalDevProfile()) {
            return loadDevProfile();
        }

        const userId = pb.authStore.model?.id;
        if (!userId) throw new Error("User not logged in");

        let snapshotId: string;
        let created_at: string = new Date().toISOString();
        let snapshotRecord: Record<string, unknown>;

        try {
            snapshotRecord = await pb.collection('health_snapshots').getFirstListItem('is_active=true', {
                sort: '-created',
            }) as unknown as Record<string, unknown>;
            snapshotId = snapshotRecord.id as string;
            created_at = snapshotRecord.created as string;
        } catch (e) {
            snapshotRecord = await pb.collection('health_snapshots').create({
                user: userId,
                label: 'Initial Profile',
                is_active: true
            }) as unknown as Record<string, unknown>;
            snapshotId = snapshotRecord.id as string;
            created_at = snapshotRecord.created as string;
        }

        let lifestyle_intake: HealthIntake | null = null;
        const rawIntake = snapshotRecord.intake_profile_json;
        if (typeof rawIntake === 'string' && rawIntake.trim()) {
            try {
                lifestyle_intake = JSON.parse(rawIntake) as HealthIntake;
            } catch {
                lifestyle_intake = null;
            }
        }
        const onboarding_complete = Boolean(snapshotRecord.onboarding_complete);

        // Load related data in parallel
        const [symptoms, interventions, goals, biometricsList, labs] = await Promise.all([
            pb.collection('symptoms').getFullList<Symptom>({ filter: `snapshot="${snapshotId}"` }),
            pb.collection('interventions').getFullList<Intervention>({ filter: `snapshot="${snapshotId}"` }),
            pb.collection('goals').getFullList<Goal>({ filter: `snapshot="${snapshotId}"` }),
            pb.collection('biometrics').getFullList<Biometrics>({ filter: `snapshot="${snapshotId}"` }),
            pb.collection('labs').getFullList<Lab>({ filter: `snapshot="${snapshotId}"` }),
        ]);

        // Biometrics is 1:1, so take first or empty
        const biometrics = biometricsList[0] || {};

        const draft: UserProfile = {
            snapshot_id: snapshotId,
            created_at,
            onboarding_complete,
            lifestyle_intake,
            symptoms,
            interventions,
            goals,
            biometrics,
            labs
        };

        const readiness = computeReadiness(draft).readiness;
        const tier = Math.min(4, Math.floor(readiness / 25)) as Tier;

        return { ...draft, tier };
    }

    /**
     * Save the entire profile. Strategy:
     *   1. Biometrics: 1:1 with snapshot — upsert.
     *   2. Symptoms / Labs / Goals / Interventions: many:1.
     *      - Items with a real PB ID (15-char alphanumeric) are updated.
     *      - Items with a frontend-generated id (e.g. timestamp/UUID) are created.
     *      - Items deleted in the UI are also deleted on the backend (we diff
     *        against the current set on disk).
     *   3. Snapshot fields: onboarding_complete + intake_profile_json.
     *
     * Per-collection work is fanned out with Promise.all for snappy saves.
     */
    static async saveProfile(profile: UserProfile): Promise<void> {
        if (useLocalDevProfile()) {
            persistDevProfile(profile);
            return;
        }

        const snapshotId = profile.snapshot_id;
        if (!snapshotId) throw new Error("No active snapshot ID");

        await Promise.all([
            saveBiometrics(snapshotId, profile.biometrics),
            saveListCollection<Symptom>(snapshotId, 'symptoms', profile.symptoms),
            saveListCollection<Lab>(snapshotId, 'labs', profile.labs),
            saveListCollection<Goal>(snapshotId, 'goals', profile.goals),
            saveListCollection<Intervention>(snapshotId, 'interventions', profile.interventions),
        ]);

        const snapUpdate: Record<string, unknown> = {};
        if (typeof profile.onboarding_complete === 'boolean') {
            snapUpdate.onboarding_complete = profile.onboarding_complete;
        }
        if (profile.lifestyle_intake !== undefined) {
            snapUpdate.intake_profile_json = profile.lifestyle_intake
                ? JSON.stringify(profile.lifestyle_intake)
                : '';
        }
        if (Object.keys(snapUpdate).length > 0) {
            try {
                await pb.collection('health_snapshots').update(snapshotId, snapUpdate);
            } catch {
                // Older PocketBase schemas without intake fields — ignore so profile rows still save.
            }
        }
    }
}

/** Heuristic: PocketBase server-issued IDs are 15 alphanumeric chars. */
function isPbId(id: string | undefined): id is string {
    return !!id && /^[a-zA-Z0-9]{15}$/.test(id);
}

async function saveBiometrics(snapshotId: string, biometrics: Biometrics | undefined): Promise<void> {
    if (!biometrics) return;
    const bioList = await pb.collection('biometrics').getFullList({ filter: `snapshot="${snapshotId}"` });
    const payload = { ...biometrics, snapshot: snapshotId };
    if (bioList.length > 0) {
        await pb.collection('biometrics').update(bioList[0].id, payload);
    } else {
        await pb.collection('biometrics').create(payload);
    }
}

interface IdentifiableRow { id?: string }

/**
 * Generic upsert + soft-delete for a snapshot-scoped child collection. Items
 * present on disk that are not in `incoming` get deleted, so the UI can
 * actually remove rows by removing them from local state and saving.
 */
async function saveListCollection<T extends IdentifiableRow>(
    snapshotId: string,
    collectionName: string,
    incoming: T[],
): Promise<void> {
    const existing = await pb.collection(collectionName).getFullList<{ id: string }>({
        filter: `snapshot="${snapshotId}"`,
    });
    const incomingIds = new Set(
        incoming.map((it) => it.id).filter((id): id is string => isPbId(id))
    );

    const ops: Promise<unknown>[] = [];

    for (const item of incoming) {
        const payload: Record<string, unknown> = { ...(item as unknown as Record<string, unknown>), snapshot: snapshotId };
        if (isPbId(item.id)) {
            ops.push(pb.collection(collectionName).update(item.id as string, payload));
        } else {
            delete payload.id;
            ops.push(pb.collection(collectionName).create(payload));
        }
    }

    for (const row of existing) {
        if (!incomingIds.has(row.id)) {
            ops.push(pb.collection(collectionName).delete(row.id));
        }
    }

    await Promise.all(ops);
}
