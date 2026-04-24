import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { downloadAndWrite } from '../../../src/generation/utils/download-and-write.js';
import * as registry from '../../../src/storage/providers/registry.js';

type MockProvider = { write: ReturnType<typeof vi.fn> };

function mockProvider(): MockProvider {
  return { write: vi.fn().mockResolvedValue(undefined) };
}

// Helper: build a Response-like object that matches the subset of the
// Fetch API surface downloadAndWrite touches. Keeps us off a full fetch
// mock library for the unit tests.
function fakeResponse(opts: {
  ok?: boolean;
  status?: number;
  statusText?: string;
  contentType?: string | null;
  body?: Uint8Array;
}): Response {
  const body = opts.body ?? new Uint8Array([1, 2, 3, 4]);
  return {
    ok: opts.ok ?? true,
    status: opts.status ?? 200,
    statusText: opts.statusText ?? 'OK',
    headers: {
      get: (key: string) =>
        key.toLowerCase() === 'content-type' ? (opts.contentType ?? null) : null,
    },
    arrayBuffer: () =>
      Promise.resolve(body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength)),
  } as unknown as Response;
}

describe('downloadAndWrite', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;
  let getProviderSpy: ReturnType<typeof vi.spyOn>;
  let provider: MockProvider;

  beforeEach(() => {
    provider = mockProvider();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fetchSpy = vi.spyOn(globalThis, 'fetch') as any;
    getProviderSpy = vi.spyOn(registry, 'getProvider').mockReturnValue(
      provider as unknown as ReturnType<typeof registry.getProvider>,
    );
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    getProviderSpy.mockRestore();
  });

  it('writes bytes to the provider using Content-Type MIME', async () => {
    fetchSpy.mockResolvedValue(
      fakeResponse({ contentType: 'video/mp4', body: new Uint8Array([10, 20, 30]) }),
    );

    const result = await downloadAndWrite(
      'https://example.com/out.mp4',
      'local/out.mp4',
    );

    expect(result).toEqual({ mime: 'video/mp4', bytes: 3 });
    expect(provider.write).toHaveBeenCalledTimes(1);
    const [uri, buffer, mime] = provider.write.mock.calls[0];
    expect(uri).toBe('local/out.mp4');
    expect(mime).toBe('video/mp4');
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(Array.from(buffer)).toEqual([10, 20, 30]);
  });

  it('strips Content-Type parameters (charset, boundary) before handing MIME to provider', async () => {
    fetchSpy.mockResolvedValue(
      fakeResponse({ contentType: 'video/mp4; charset=binary' }),
    );

    const result = await downloadAndWrite('https://example.com/x', 'out.mp4');
    expect(result.mime).toBe('video/mp4');
  });

  it('falls back to defaultMime when Content-Type header is missing', async () => {
    fetchSpy.mockResolvedValue(fakeResponse({ contentType: null }));

    const result = await downloadAndWrite('https://example.com/x', 'out.mp4');
    expect(result.mime).toBe('video/mp4');
    expect(provider.write.mock.calls[0][2]).toBe('video/mp4');
  });

  it('honours an explicit defaultMime override', async () => {
    fetchSpy.mockResolvedValue(fakeResponse({ contentType: null }));

    const result = await downloadAndWrite('https://example.com/x', 'out.bin', {
      defaultMime: 'application/octet-stream',
    });

    expect(result.mime).toBe('application/octet-stream');
  });

  it('rejects text/html responses without writing to the provider', async () => {
    fetchSpy.mockResolvedValue(fakeResponse({ contentType: 'text/html; charset=utf-8' }));

    await expect(
      downloadAndWrite('https://example.com/error-page', 'out.mp4'),
    ).rejects.toThrow(/text\/html/);
    expect(provider.write).not.toHaveBeenCalled();
  });

  it('throws and does not write when the response is not ok', async () => {
    fetchSpy.mockResolvedValue(
      fakeResponse({ ok: false, status: 403, statusText: 'Forbidden' }),
    );

    await expect(
      downloadAndWrite('https://example.com/x', 'out.mp4'),
    ).rejects.toThrow(/403 Forbidden/);
    expect(provider.write).not.toHaveBeenCalled();
  });

  it('passes extra headers to fetch when supplied (Veo Files API auth)', async () => {
    fetchSpy.mockResolvedValue(fakeResponse({ contentType: 'video/mp4' }));

    await downloadAndWrite('https://generativelanguage.googleapis.com/v1/files/x', 'out.mp4', {
      headers: { 'x-goog-api-key': 'test-key' },
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://generativelanguage.googleapis.com/v1/files/x',
      { headers: { 'x-goog-api-key': 'test-key' } },
    );
  });

  it('omits fetch options entirely when no headers supplied', async () => {
    fetchSpy.mockResolvedValue(fakeResponse({ contentType: 'video/mp4' }));

    await downloadAndWrite('https://example.com/x', 'out.mp4');

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://example.com/x',
      undefined,
    );
  });

  it('propagates the provider write error unchanged', async () => {
    fetchSpy.mockResolvedValue(fakeResponse({ contentType: 'video/mp4' }));
    provider.write.mockRejectedValue(new Error('disk full'));

    await expect(
      downloadAndWrite('https://example.com/x', 'out.mp4'),
    ).rejects.toThrow(/disk full/);
  });
});
