import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// Real-module test for getFalClient. Does NOT mock @fal-ai/client — we
// want the actual SDK wiring so the missing-key error shape and singleton
// behavior reflect production.

describe('getFalClient', () => {
  let prevKey: string | undefined;

  beforeEach(() => {
    prevKey = process.env.FAL_KEY;
  });

  afterEach(() => {
    if (prevKey === undefined) {
      delete process.env.FAL_KEY;
    } else {
      process.env.FAL_KEY = prevKey;
    }
  });

  it('throws a descriptive error when FAL_KEY is unset', async () => {
    delete process.env.FAL_KEY;
    // Fresh import so the module-level cache is clean for this test.
    const mod = await import('../../../src/generation/fal/client.js?missing');
    expect(() => mod.getFalClient()).toThrow(
      /FAL_KEY.*environment variable.*fal\.ai\/dashboard\/keys/s,
    );
  });

  it('returns a client with queue + storage clients when FAL_KEY is set', async () => {
    process.env.FAL_KEY = 'test-key-abc123';
    const mod = await import('../../../src/generation/fal/client.js?ok');
    const client = mod.getFalClient();
    expect(client).toBeDefined();
    // Spot-check the SDK surface we rely on elsewhere — storage.upload
    // and subscribe() on the root client object.
    expect(typeof client.storage?.upload).toBe('function');
    expect(typeof client.subscribe).toBe('function');
  });

  it('caches the client instance across calls (singleton)', async () => {
    process.env.FAL_KEY = 'test-key-def456';
    const mod = await import('../../../src/generation/fal/client.js?singleton');
    const a = mod.getFalClient();
    const b = mod.getFalClient();
    expect(a).toBe(b);
  });
});
