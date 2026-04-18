import { GoogleGenAI } from '@google/genai';

let cachedClient: GoogleGenAI | null = null;
let cachedLiveClient: GoogleGenAI | null = null;

function requireApiKey(): string {
  const apiKey = process.env['GOOGLE_API_KEY'];
  if (!apiKey) {
    throw new Error(
      'GOOGLE_API_KEY environment variable is not set. ' +
        'Get a key at https://aistudio.google.com/apikey and set it before using generation tools.',
    );
  }
  return apiKey;
}

/**
 * Get the shared GoogleGenAI client instance.
 *
 * Lazily initialized on first call — so the server starts even when
 * GOOGLE_API_KEY is not set (non-generation tools still work).
 * Throws a clear error if the key is missing when a generation tool
 * is actually invoked.
 */
export function getGenAIClient(): GoogleGenAI {
  if (cachedClient) return cachedClient;
  cachedClient = new GoogleGenAI({ apiKey: requireApiKey() });
  return cachedClient;
}

/**
 * Get a GoogleGenAI client pinned to apiVersion `v1alpha`. Required for
 * live APIs like `client.live.music.connect` (Lyria RealTime) — on the
 * default v1beta endpoint the websocket upgrade never completes and the
 * connect call hangs until the caller's deadline fires.
 */
export function getGenAIClientForLive(): GoogleGenAI {
  if (cachedLiveClient) return cachedLiveClient;
  cachedLiveClient = new GoogleGenAI({
    apiKey: requireApiKey(),
    apiVersion: 'v1alpha',
  });
  return cachedLiveClient;
}
