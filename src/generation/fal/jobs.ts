import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

/**
 * Local record of fal queue jobs (TODO #32).
 *
 * When the MCP client stops a long tool call, the tool's reply never reaches
 * the caller, so a request_id carried only in that reply is lost. Every
 * submit and outcome is appended here as one JSON line, which
 * `fal_fetch_result` lists so a lost job can still be found by id.
 *
 * Append-only and best-effort: a write failure is logged, never thrown, so a
 * read-only temp dir cannot break generation.
 */

export type FalJobEvent = 'submitted' | 'completed' | 'failed' | 'timed_out' | 'cancelled';

export interface FalJobRecord {
  ts: string;
  event: FalJobEvent;
  tool: string;
  model: string;
  request_id: string;
  output?: string;
  detail?: string;
}

/** Path of the job log. `ARTIFICER_FAL_JOBS_FILE` overrides it (tests). */
export function falJobsFile(): string {
  return process.env['ARTIFICER_FAL_JOBS_FILE'] ?? join(tmpdir(), 'artificer', 'fal-jobs.jsonl');
}

export async function recordFalJob(rec: Omit<FalJobRecord, 'ts'>): Promise<void> {
  const file = falJobsFile();
  try {
    await mkdir(dirname(file), { recursive: true });
    await appendFile(file, JSON.stringify({ ts: new Date().toISOString(), ...rec }) + '\n');
  } catch (err) {
    console.error(`fal job log: could not write ${file}: ${(err as Error).message}`);
  }
}

/** Latest state per request, newest first. */
export interface FalJobSummary extends FalJobRecord {
  submitted: string;
}

export async function listFalJobs(limit = 20): Promise<FalJobSummary[]> {
  let text: string;
  try {
    text = await readFile(falJobsFile(), 'utf8');
  } catch {
    return [];
  }
  const byId = new Map<string, FalJobSummary>();
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    let rec: FalJobRecord;
    try {
      rec = JSON.parse(line) as FalJobRecord;
    } catch {
      continue;
    }
    const prev = byId.get(rec.request_id);
    byId.set(rec.request_id, {
      ...prev,
      ...rec,
      output: rec.output ?? prev?.output,
      submitted: prev?.submitted ?? rec.ts,
    });
  }
  return [...byId.values()].sort((a, b) => b.submitted.localeCompare(a.submitted)).slice(0, limit);
}

export async function findFalJob(requestId: string): Promise<FalJobSummary | undefined> {
  return (await listFalJobs(Number.MAX_SAFE_INTEGER)).find((j) => j.request_id === requestId);
}
