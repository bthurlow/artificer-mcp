import { GoogleGenAI } from '@google/genai';

let cachedClient: GoogleGenAI | null = null;
let cachedLiveClient: GoogleGenAI | null = null;
let cachedVertexClient: GoogleGenAI | null = null;

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

/**
 * Get a GoogleGenAI client backed by **Vertex AI** rather than the Gemini
 * Developer API.
 *
 * A few Google methods — notably `models.upscaleImage` — are Vertex-only.
 * Called with a plain `GOOGLE_API_KEY` they fail deep inside the SDK with
 * "This method is only supported by the Vertex AI client", which reads like
 * a bug rather than a configuration gap. This throws up front instead, and
 * names the env vars needed to fix it.
 *
 * @param toolName Tool name to attribute the error to.
 */
export function getGenAIClientForVertex(toolName: string): GoogleGenAI {
  if (cachedVertexClient) return cachedVertexClient;

  const project = process.env['GOOGLE_CLOUD_PROJECT']?.trim();
  const location = process.env['GOOGLE_CLOUD_LOCATION']?.trim() || 'us-central1';

  if (!project) {
    throw new Error(
      `${toolName} requires Vertex AI credentials, which are not configured. ` +
        'This method is not available on the Gemini Developer API, so a GOOGLE_API_KEY alone ' +
        'is not enough. Set GOOGLE_CLOUD_PROJECT (and optionally GOOGLE_CLOUD_LOCATION, ' +
        'default "us-central1") and authenticate with Application Default Credentials — ' +
        '`gcloud auth application-default login`, or point GOOGLE_APPLICATION_CREDENTIALS ' +
        'at a service-account key file.',
    );
  }

  cachedVertexClient = new GoogleGenAI({ vertexai: true, project, location });
  return cachedVertexClient;
}
