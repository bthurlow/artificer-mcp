import { openAsBlob } from 'node:fs';
import { basename } from 'node:path';
import type { ToolExtra } from '../../utils/register.js';

/**
 * Plain-HTTP client for the MVSep separation API (mvsep.com/en/full_api),
 * TODO #35. There is no official JS SDK, and the third-party PyPI
 * `mvsep-cli` asks for your token from an unpublished source, so this talks
 * to the documented endpoints directly:
 *
 *   POST {base}/separation/create   multipart: api_token, audiofile | url,
 *                                    sep_type, add_opt1..3, output_format,
 *                                    is_demo → data.hash
 *   GET  {base}/separation/get?hash  status, data.files[] = {url, download}
 *   POST {base}/separation/cancel   api_token, hash (refunds if not started)
 *
 * `is_demo` is always sent as 0: 1 publishes the job, input and outputs, on
 * MVSep's public demo page.
 *
 * Jobs live in the region that created them (mvsep.com geo-routes to de,
 * de2 or sg), and the download URLs it returns point there.
 */

export const MVSEP_DEFAULT_BASE = 'https://mvsep.com/api';

export function requireMvsepToken(): string {
  const token = process.env['MVSEP_API_TOKEN']?.trim();
  if (!token) {
    throw new Error(
      'MVSEP_API_TOKEN environment variable is not set. Get a key at https://mvsep.com/user-api ' +
        '(keys issued before 6 October 2026 were reset after the October security incident: regenerate it there) ' +
        'and set it before using mvsep tools.',
    );
  }
  return token;
}

/** API base: MVSEP_API_URL (e.g. a pinned region, https://de.mvsep.com/api) or the geo-routed default. */
export function mvsepBase(): string {
  return (process.env['MVSEP_API_URL']?.trim() || MVSEP_DEFAULT_BASE).replace(/\/+$/, '');
}

/** One output file of a finished job. */
export interface MvsepFile {
  url: string;
  /** MVSep's file name, e.g. "song_male_female_mt_2_male.wav". */
  download: string;
}

export interface MvsepStatus {
  status: string;
  data: Record<string, unknown>;
}

/** Output formats by name → MVSep's `output_format` code. */
export const MVSEP_OUTPUT_FORMATS = {
  mp3: 0,
  wav16: 1,
  flac16: 2,
  m4a: 3,
  wav32: 4,
  flac24: 5,
} as const;
export type MvsepOutputFormat = keyof typeof MVSEP_OUTPUT_FORMATS;

/** Statuses after which polling continues. */
const PENDING = new Set(['waiting', 'processing', 'distributing', 'merging']);

/** An API error message, without ever echoing the token. */
async function apiError(what: string, res: Response): Promise<Error> {
  let detail = '';
  try {
    const body = (await res.json()) as { data?: { message?: unknown }; message?: unknown };
    const msg = body.data?.message ?? body.message;
    if (typeof msg === 'string') detail = `: ${msg}`;
  } catch {
    // not JSON; the status says enough
  }
  const hint = res.status === 401 ? ' (unknown api_token: check MVSEP_API_TOKEN)' : '';
  return new Error(`MVSep ${what} failed (HTTP ${res.status})${hint}${detail}`);
}

export interface CreateSeparationOptions {
  token: string;
  /** A local file to upload, or a public URL for MVSep to fetch. */
  audio: { path: string } | { url: string };
  sepType: number;
  addOpts: { add_opt1?: string; add_opt2?: string; add_opt3?: string };
  outputFormat: MvsepOutputFormat;
}

export async function createSeparation(opts: CreateSeparationOptions): Promise<string> {
  const form = new FormData();
  form.append('api_token', opts.token);
  if ('path' in opts.audio) {
    form.append('audiofile', await openAsBlob(opts.audio.path), basename(opts.audio.path));
  } else {
    form.append('url', opts.audio.url);
    form.append('remote_type', 'direct');
  }
  form.append('sep_type', String(opts.sepType));
  for (const [key, value] of Object.entries(opts.addOpts)) {
    if (value !== undefined) form.append(key, value);
  }
  form.append('output_format', String(MVSEP_OUTPUT_FORMATS[opts.outputFormat]));
  form.append('is_demo', '0');

  const res = await fetch(`${mvsepBase()}/separation/create`, { method: 'POST', body: form });
  if (!res.ok) throw await apiError('create', res);
  const body = (await res.json()) as {
    success?: boolean;
    data?: { hash?: unknown; message?: unknown };
  };
  if (!body.success || typeof body.data?.hash !== 'string') {
    const msg = typeof body.data?.message === 'string' ? `: ${body.data.message}` : '';
    throw new Error(`MVSep create failed${msg}`);
  }
  return body.data.hash;
}

/** Thrown for HTTP 429, so the poll loop backs off instead of counting an error. */
export class MvsepRateLimited extends Error {}

export async function getSeparation(hash: string): Promise<MvsepStatus> {
  const res = await fetch(`${mvsepBase()}/separation/get?hash=${encodeURIComponent(hash)}`);
  if (res.status === 429) throw new MvsepRateLimited('MVSep rate limit (HTTP 429)');
  if (!res.ok) throw await apiError('status check', res);
  const body = (await res.json()) as { status?: unknown; data?: unknown };
  return {
    status: typeof body.status === 'string' ? body.status : 'unknown',
    data:
      typeof body.data === 'object' && body.data !== null
        ? (body.data as Record<string, unknown>)
        : {},
  };
}

export async function cancelSeparation(token: string, hash: string): Promise<void> {
  const form = new FormData();
  form.append('api_token', token);
  form.append('hash', hash);
  const res = await fetch(`${mvsepBase()}/separation/cancel`, { method: 'POST', body: form });
  if (!res.ok) throw await apiError('cancel', res);
}

/** The finished job's files; `data.files` may be an array or an object of entries. */
export function extractMvsepFiles(data: Record<string, unknown>): MvsepFile[] {
  const raw = data['files'];
  const entries = Array.isArray(raw)
    ? raw
    : typeof raw === 'object' && raw !== null
      ? Object.values(raw)
      : [];
  const files: MvsepFile[] = [];
  for (const entry of entries) {
    if (typeof entry !== 'object' || entry === null) continue;
    const { url, download } = entry as { url?: unknown; download?: unknown };
    if (typeof url !== 'string' || !url) continue;
    const clean = url.replace(/\\\//g, '/');
    const name =
      typeof download === 'string' && download
        ? download
        : decodeURIComponent(new URL(clean).pathname.split('/').pop() ?? '');
    files.push({ url: clean, download: name });
  }
  return files;
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal?.aborted) return resolve();
    const timer = setTimeout(done, ms);
    function done(): void {
      clearTimeout(timer);
      signal?.removeEventListener('abort', done);
      resolve();
    }
    signal?.addEventListener('abort', done, { once: true });
  });
}

/** Status-check failures tolerated in a row before giving up. */
const MAX_STATUS_ERRORS = 3;

export interface WaitOptions {
  tool: string;
  token: string;
  hash: string;
  timeoutSeconds: number;
  extra?: ToolExtra;
  /** Default 5000: the API allows 60 requests a minute. */
  pollIntervalMs?: number;
}

/**
 * Poll a job until it is done, like runFalJob: progress messages carry the
 * hash; on the deadline or a client cancel the job is cancelled on MVSep
 * (refunded if it had not started) and the error names the hash.
 */
export async function waitForSeparation(opts: WaitOptions): Promise<MvsepStatus> {
  const { tool, token, hash, extra } = opts;
  const pollIntervalMs = opts.pollIntervalMs ?? 5000;
  const signal = extra?.signal;
  const deadline = Date.now() + opts.timeoutSeconds * 1000;

  let progress = 0;
  const notify = async (message: string): Promise<void> => {
    const progressToken = extra?._meta?.progressToken;
    if (progressToken === undefined || !extra?.sendNotification) return;
    try {
      await extra.sendNotification({
        method: 'notifications/progress',
        params: { progressToken, progress: ++progress, message },
      });
    } catch {
      // Progress is advisory; a closed transport must not fail the job.
    }
  };
  const giveUp = async (why: string): Promise<Error> => {
    let cancelled = 'cancelled on MVSep';
    try {
      await cancelSeparation(token, hash);
    } catch (err) {
      cancelled = `cancel failed: ${(err as Error).message}`;
    }
    return new Error(
      `${tool}: ${why}; job ${hash} ${cancelled}. If it had already finished, pass hash "${hash}" to collect it.`,
    );
  };

  let errors = 0;
  let last = '';
  for (;;) {
    if (signal?.aborted) throw await giveUp('cancelled by the client');
    let status: MvsepStatus | undefined;
    try {
      status = await getSeparation(hash);
      errors = 0;
    } catch (err) {
      if (!(err instanceof MvsepRateLimited) && ++errors >= MAX_STATUS_ERRORS) {
        throw new Error(
          `${tool}: ${MAX_STATUS_ERRORS} status checks in a row failed for job ${hash} (${(err as Error).message}). ` +
            `It may still finish: pass hash "${hash}" to collect it.`,
          { cause: err },
        );
      }
    }
    if (status) {
      if (status.status === 'done') return status;
      if (!PENDING.has(status.status)) {
        const msg = typeof status.data['message'] === 'string' ? `: ${status.data['message']}` : '';
        throw new Error(`${tool}: MVSep job ${hash} ${status.status}${msg}`);
      }
      const { queue_count: count, current_order: order } = status.data;
      const desc =
        status.status === 'waiting' && typeof order === 'number'
          ? `waiting (position ${order}${typeof count === 'number' ? ` of ${count}` : ''})`
          : status.status;
      if (desc !== last) {
        last = desc;
        await notify(`MVSep job ${hash}: ${desc}`);
      }
    }
    if (Date.now() >= deadline) {
      throw await giveUp(
        `not done after ${opts.timeoutSeconds}s (last status: ${last || 'unknown'})`,
      );
    }
    await sleep(Math.min(pollIntervalMs, Math.max(0, deadline - Date.now())), signal);
  }
}
