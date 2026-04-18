import { pb } from './pocketbase';
import { useLocalDevProfile } from './authBypass';
import type { CouncilReport, ExpertReport, CouncilResponse } from '../types';

const DEV_LS_KEY = 'ho_dev_council_reports_v1';
const MAX_DEV_REPORTS = 25;

/** A persisted report row, decoupled from PB's record shape. */
export interface StoredCouncilReport extends CouncilReport {
  /** Backend record id ('local-...' for dev mode). */
  id: string;
  /** Snapshot the report was generated against (null for dev). */
  snapshot_id?: string;
}

interface PbReportRecord {
  id: string;
  user: string;
  snapshot?: string;
  query?: string;
  experts_json?: string;
  synthesis_json?: string;
  generated_at?: string;
  created: string;
  updated: string;
}

function safeParse<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function pbRecordToStored(record: PbReportRecord): StoredCouncilReport {
  return {
    id: record.id,
    snapshot_id: record.snapshot,
    generated_at: record.generated_at || record.created,
    query: record.query || '',
    experts: safeParse<ExpertReport[]>(record.experts_json, []),
    synthesis: safeParse<CouncilResponse>(record.synthesis_json, {
      key_insights: '',
      recommendations: { immediate_safe: [], consider: [], explore_with_testing: [], avoid: [] },
      why_experts_differ: '',
      next_best_step: '',
      disclaimer: '',
    }),
  };
}

function loadDevReports(): StoredCouncilReport[] {
  try {
    const raw = localStorage.getItem(DEV_LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredCouncilReport[]) : [];
  } catch {
    return [];
  }
}

function saveDevReports(reports: StoredCouncilReport[]): void {
  try {
    localStorage.setItem(DEV_LS_KEY, JSON.stringify(reports.slice(0, MAX_DEV_REPORTS)));
  } catch (err) {
    console.warn('Failed to persist dev council reports:', err);
  }
}

export class CouncilReportStore {
  /**
   * Save a freshly generated report. Returns the stored row (with id), or null
   * if persistence silently failed (we never want this to break the UX).
   */
  static async save(report: CouncilReport, snapshotId?: string): Promise<StoredCouncilReport | null> {
    if (useLocalDevProfile()) {
      const stored: StoredCouncilReport = {
        ...report,
        id: `local-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        snapshot_id: snapshotId,
      };
      const existing = loadDevReports();
      saveDevReports([stored, ...existing]);
      return stored;
    }

    const userId = pb.authStore.model?.id;
    if (!userId) return null;

    try {
      const created = (await pb.collection('council_reports').create({
        user: userId,
        snapshot: snapshotId,
        query: report.query,
        experts_json: JSON.stringify(report.experts),
        synthesis_json: JSON.stringify(report.synthesis),
        generated_at: report.generated_at,
      })) as unknown as PbReportRecord;
      return pbRecordToStored(created);
    } catch (err) {
      // The PB collection may not exist yet (migration not applied). Don't
      // block the UX — log and move on. The report still lives in memory.
      console.warn('Failed to persist council report to PocketBase:', err);
      return null;
    }
  }

  /** List the user's most recent reports. Newest first. */
  static async list(limit = 10): Promise<StoredCouncilReport[]> {
    if (useLocalDevProfile()) {
      return loadDevReports().slice(0, limit);
    }

    if (!pb.authStore.model?.id) return [];

    try {
      const result = await pb.collection('council_reports').getList<PbReportRecord>(1, limit, {
        sort: '-created',
      });
      return result.items.map(pbRecordToStored);
    } catch (err) {
      console.warn('Failed to load council reports from PocketBase:', err);
      return [];
    }
  }

  /** Delete a stored report (best effort). */
  static async remove(id: string): Promise<void> {
    if (useLocalDevProfile() || id.startsWith('local-')) {
      const remaining = loadDevReports().filter((r) => r.id !== id);
      saveDevReports(remaining);
      return;
    }
    try {
      await pb.collection('council_reports').delete(id);
    } catch (err) {
      console.warn('Failed to delete council report:', err);
    }
  }
}
