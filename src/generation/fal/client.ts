import { createFalClient, type FalClient } from '@fal-ai/client';

let cachedClient: FalClient | null = null;

function requireApiKey(): string {
  const apiKey = process.env['FAL_KEY'];
  if (!apiKey) {
    throw new Error(
      'FAL_KEY environment variable is not set. ' +
        'Get a key at https://fal.ai/dashboard/keys and set it before using fal generation tools.',
    );
  }
  return apiKey;
}

/**
 * Get the shared FalClient instance.
 *
 * Lazily initialized on first call — so the server starts even when
 * FAL_KEY is not set (non-fal tools still work).
 * Throws a clear error if the key is missing when a fal tool is actually invoked.
 */
export function getFalClient(): FalClient {
  if (cachedClient) return cachedClient;
  cachedClient = createFalClient({ credentials: requireApiKey() });
  return cachedClient;
}
