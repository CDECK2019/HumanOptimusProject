import { pb } from './pocketbase';
import { UserProfile, Symptom, Intervention, Goal, Biometrics, Lab } from '../types';

export class DataService {

    // Get or Create the current active snapshot for the user
    static async getActiveSnapshot(): Promise<UserProfile> {
        const userId = pb.authStore.model?.id;
        if (!userId) throw new Error("User not logged in");

        let snapshotId: string;
        let created_at: string = new Date().toISOString();

        try {
            // Try to find active snapshot
            const record = await pb.collection('health_snapshots').getFirstListItem('is_active=true', {
                sort: '-created',
            });
            snapshotId = record.id;
            created_at = record.created;
        } catch (e) {
            // Create new one if none exists
            const record = await pb.collection('health_snapshots').create({
                user: userId,
                label: 'Initial Profile',
                is_active: true
            });
            snapshotId = record.id;
            created_at = record.created;
        }

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

        return {
            snapshot_id: snapshotId,
            created_at,
            tier: 0, // Computed by frontend usually
            symptoms,
            interventions,
            goals,
            biometrics,
            labs
        };
    }

    // Save the entire profile
    // Strategy: For MVP, we will simpler Logic:
    // 1. Snapshot: update label/timestamp if needed (mostly passive)
    // 2. Relations: We need to handle IDs. 
    //    - If an item has an ID, update it. 
    //    - If it's new (no ID or temp ID), create it.
    //    - If it's gone from the list... (Hard to track deletions in this simple UI without a diff).
    //    - SIMPLIFICATION FOR MVP: We will just "Upsert" items provided. Deletion is out of scope for "Auto-save", user must explicitly delete in UI (which we can add methods for).
    static async saveProfile(profile: UserProfile): Promise<void> {
        const snapshotId = profile.snapshot_id;
        if (!snapshotId) throw new Error("No active snapshot ID");

        // 1. Biometrics (Upsert)
        if (profile.biometrics) {
            // Check if exists
            const bioList = await pb.collection('biometrics').getFullList({ filter: `snapshot="${snapshotId}"` });
            const payload = { ...profile.biometrics, snapshot: snapshotId };
            if (bioList.length > 0) {
                await pb.collection('biometrics').update(bioList[0].id, payload);
            } else {
                await pb.collection('biometrics').create(payload);
            }
        }

        // 2. Symptoms
        for (const item of profile.symptoms) {
            // If it looks like a valid PB ID (15 chars), update. Else create.
            const payload = { ...item, snapshot: snapshotId };
            if (item.id && item.id.length === 15) {
                await pb.collection('symptoms').update(item.id, payload);
            } else {
                // Remove temp ID if it's a UUID/random string from frontend
                const { id, ...cleanPayload } = payload;
                await pb.collection('symptoms').create(cleanPayload);
            }
        }

        // 3. Labs (Same logic)
        for (const item of profile.labs) {
            const payload = { ...item, snapshot: snapshotId };
            if (item.id && item.id.length === 15) {
                await pb.collection('labs').update(item.id, payload);
            } else {
                const { id, ...cleanPayload } = payload;
                await pb.collection('labs').create(cleanPayload);
            }
        }

        // 4. Goals
        for (const item of profile.goals) {
            const payload = { ...item, snapshot: snapshotId };
            if (item.id && item.id.length === 15) {
                await pb.collection('goals').update(item.id, payload);
            } else {
                const { id, ...cleanPayload } = payload;
                await pb.collection('goals').create(cleanPayload);
            }
        }

        // 5. Interventions
        for (const item of profile.interventions) {
            const payload = { ...item, snapshot: snapshotId };
            if (item.id && item.id.length === 15) {
                await pb.collection('interventions').update(item.id, payload);
            } else {
                const { id, ...cleanPayload } = payload;
                await pb.collection('interventions').create(cleanPayload);
            }
        }
    }
}
