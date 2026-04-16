import { GoogleGenAI } from '@google/genai';

let cachedClient: GoogleGenAI | null = null;

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

  const apiKey = process.env['GOOGLE_API_KEY'];
  if (!apiKey) {
    throw new Error(
      'GOOGLE_API_KEY environment variable is not set. ' +
        'Get a key at https://aistudio.google.com/apikey and set it before using generation tools.',
    );
  }

  cachedClient = new GoogleGenAI({ apiKey });
  return cachedClient;
}
