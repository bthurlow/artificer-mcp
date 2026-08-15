import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks set up BEFORE any import of safety.ts so getFalClient and
// loadCatalog resolve to stubs rather than hitting real state.
// ---------------------------------------------------------------------------

const mockSubscribe = vi.fn();

vi.mock('../../../src/generation/fal/client.js', () => ({
  getFalClient: () => ({
    subscribe: mockSubscribe,
    storage: { upload: vi.fn() },
  }),
}));

type CatalogData = Parameters<typeof setCatalogData>[0];
let currentCatalogData: CatalogData | null = null;

function setCatalogData(data: {
  safety?: {
    text?: Array<{
      slug: string;
      prompt_guide: string | null;
      access_routes: Array<{
        provider: string;
        tool: string;
        model: string;
        cost: string;
        key_env_var: string;
        stub: boolean;
      }>;
    }>;
  };
} | null) {
  currentCatalogData = data;
}

vi.mock('../../../src/catalog/catalog.js', () => ({
  loadCatalog: async () =>
    currentCatalogData
      ? { ok: true, data: currentCatalogData }
      : { ok: false, error: 'no catalog in test' },
}));

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import {
  registerFalSafetyTools,
  resolveDefaultSafetyModel,
  normalizeSafetyResponse,
} from '../../../src/generation/fal/safety.js';

// ---------------------------------------------------------------------------
// Pure helper tests
// ---------------------------------------------------------------------------

describe('normalizeSafetyResponse', () => {
  it('flags Safe as safe:true', () => {
    expect(normalizeSafetyResponse({ label: 'Safe', categories: [] })).toEqual({
      safe: true,
      label: 'Safe',
      categories: [],
      raw: { label: 'Safe', categories: [] },
    });
  });

  it('flags Unsafe with categories as safe:false', () => {
    const raw = { label: 'Unsafe', categories: ['Violent', 'Illegal'] };
    const result = normalizeSafetyResponse(raw);
    expect(result.safe).toBe(false);
    expect(result.label).toBe('Unsafe');
    expect(result.categories).toEqual(['Violent', 'Illegal']);
    expect(result.raw).toBe(raw);
  });

  it('flags Controversial as safe:false (not Safe means not safe)', () => {
    expect(normalizeSafetyResponse({ label: 'Controversial', categories: [] }).safe).toBe(
      false,
    );
  });

  it('handles missing label with Unknown fallback', () => {
    const r = normalizeSafetyResponse({ categories: ['Whatever'] });
    expect(r.label).toBe('Unknown');
    expect(r.safe).toBe(false);
  });

  it('filters non-string categories out defensively', () => {
    const r = normalizeSafetyResponse({
      label: 'Unsafe',
      categories: ['Violent', null, 42, 'Illegal'],
    });
    expect(r.categories).toEqual(['Violent', 'Illegal']);
  });

  it('tolerates a non-object raw and returns Unknown + empty categories', () => {
    expect(normalizeSafetyResponse(null)).toEqual({
      safe: false,
      label: 'Unknown',
      categories: [],
      raw: null,
    });
    expect(normalizeSafetyResponse('boom').label).toBe('Unknown');
  });
});

describe('resolveDefaultSafetyModel', () => {
  beforeEach(() => setCatalogData(null));

  it('returns null when catalog load fails', async () => {
    setCatalogData(null);
    expect(await resolveDefaultSafetyModel()).toBeNull();
  });

  it('returns null when safety.text is missing', async () => {
    setCatalogData({});
    expect(await resolveDefaultSafetyModel()).toBeNull();
  });

  it('returns the model id when exactly one non-stub fal route exists', async () => {
    setCatalogData({
      safety: {
        text: [
          {
            slug: 'qwen-3-guard',
            prompt_guide: null,
            access_routes: [
              {
                provider: 'fal',
                tool: 'fal_classify_text',
                model: 'fal-ai/qwen-3-guard',
                cost: '$x',
                key_env_var: 'FAL_KEY',
                stub: false,
              },
            ],
          },
        ],
      },
    });
    expect(await resolveDefaultSafetyModel()).toBe('fal-ai/qwen-3-guard');
  });

  it('returns null when more than one non-stub fal route exists (forces explicit model)', async () => {
    setCatalogData({
      safety: {
        text: [
          {
            slug: 'qwen-3-guard',
            prompt_guide: null,
            access_routes: [
              {
                provider: 'fal',
                tool: 'fal_classify_text',
                model: 'fal-ai/qwen-3-guard',
                cost: '$x',
                key_env_var: 'FAL_KEY',
                stub: false,
              },
            ],
          },
          {
            slug: 'llama-guard-3',
            prompt_guide: null,
            access_routes: [
              {
                provider: 'fal',
                tool: 'fal_classify_text',
                model: 'fal-ai/llama-guard-3',
                cost: '$y',
                key_env_var: 'FAL_KEY',
                stub: false,
              },
            ],
          },
        ],
      },
    });
    expect(await resolveDefaultSafetyModel()).toBeNull();
  });

  it('ignores stubbed routes in the cardinality count', async () => {
    setCatalogData({
      safety: {
        text: [
          {
            slug: 'qwen-3-guard',
            prompt_guide: null,
            access_routes: [
              {
                provider: 'fal',
                tool: 'fal_classify_text',
                model: 'fal-ai/qwen-3-guard',
                cost: '$x',
                key_env_var: 'FAL_KEY',
                stub: false,
              },
            ],
          },
          {
            slug: 'future-guard',
            prompt_guide: null,
            access_routes: [
              {
                provider: 'fal',
                tool: 'fal_classify_text',
                model: 'fal-ai/future-guard',
                cost: 'tbd',
                key_env_var: 'FAL_KEY',
                stub: true, // <-- stub
              },
            ],
          },
        ],
      },
    });
    expect(await resolveDefaultSafetyModel()).toBe('fal-ai/qwen-3-guard');
  });

  it('returns null when the only safety entry is itself a stub', async () => {
    setCatalogData({
      safety: {
        text: [
          {
            slug: 'qwen-3-guard',
            prompt_guide: null,
            access_routes: [
              {
                provider: 'fal',
                tool: 'fal_classify_text',
                model: 'fal-ai/qwen-3-guard',
                cost: 'tbd',
                key_env_var: 'FAL_KEY',
                stub: true,
              },
            ],
          },
        ],
      },
    });
    expect(await resolveDefaultSafetyModel()).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// MCP tool-level tests
// ---------------------------------------------------------------------------

describe('fal_classify_text (MCP)', () => {
  let client: Client;
  let server: McpServer;
  let cleanup: () => Promise<void>;

  beforeAll(async () => {
    server = new McpServer({ name: 'test', version: '0.1.0' });
    registerFalSafetyTools(server);

    client = new Client({ name: 'test-client', version: '1.0.0' });
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    await client.connect(clientTransport);

    cleanup = async () => {
      await client.close();
      await server.close();
    };
  });

  afterAll(async () => {
    await cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    setCatalogData({
      safety: {
        text: [
          {
            slug: 'qwen-3-guard',
            prompt_guide: null,
            access_routes: [
              {
                provider: 'fal',
                tool: 'fal_classify_text',
                model: 'fal-ai/qwen-3-guard',
                cost: '$0.002/1K',
                key_env_var: 'FAL_KEY',
                stub: false,
              },
            ],
          },
        ],
      },
    });
  });

  it('auto-defaults to the single catalog safety model when model arg is omitted', async () => {
    mockSubscribe.mockResolvedValue({
      data: { label: 'Safe', categories: [] },
      requestId: 'req-s1',
    });

    const result = await client.callTool({
      name: 'fal_classify_text',
      arguments: { text: 'Hello, how are you today?' },
    });

    expect(mockSubscribe).toHaveBeenCalledTimes(1);
    expect(mockSubscribe.mock.calls[0][0]).toBe('fal-ai/qwen-3-guard');
    expect(mockSubscribe.mock.calls[0][1].input).toEqual({
      prompt: 'Hello, how are you today?',
    });

    const payload = JSON.parse(
      (result.content as Array<{ text: string }>)[0].text,
    );
    expect(payload.safe).toBe(true);
    expect(payload.label).toBe('Safe');
    expect(payload.categories).toEqual([]);
  });

  it('honors explicit model arg even when auto-default would match', async () => {
    mockSubscribe.mockResolvedValue({
      data: { label: 'Safe', categories: [] },
      requestId: 'req-s2',
    });

    await client.callTool({
      name: 'fal_classify_text',
      arguments: { text: 'test', model: 'fal-ai/llama-guard-3' },
    });

    expect(mockSubscribe.mock.calls[0][0]).toBe('fal-ai/llama-guard-3');
  });

  it('errors when no model is passed and auto-default is ambiguous (multiple entries)', async () => {
    setCatalogData({
      safety: {
        text: [
          {
            slug: 'qwen-3-guard',
            prompt_guide: null,
            access_routes: [
              {
                provider: 'fal',
                tool: 'fal_classify_text',
                model: 'fal-ai/qwen-3-guard',
                cost: '$x',
                key_env_var: 'FAL_KEY',
                stub: false,
              },
            ],
          },
          {
            slug: 'llama-guard-3',
            prompt_guide: null,
            access_routes: [
              {
                provider: 'fal',
                tool: 'fal_classify_text',
                model: 'fal-ai/llama-guard-3',
                cost: '$y',
                key_env_var: 'FAL_KEY',
                stub: false,
              },
            ],
          },
        ],
      },
    });

    const result = await client.callTool({
      name: 'fal_classify_text',
      arguments: { text: 'something' },
    });

    expect(result.isError).toBe(true);
    const text = (result.content as Array<{ text: string }>)[0].text;
    expect(text).toContain('`model` is required');
    expect(mockSubscribe).not.toHaveBeenCalled();
  });

  it('classifies Unsafe content correctly via fal response passthrough', async () => {
    mockSubscribe.mockResolvedValue({
      data: { label: 'Unsafe', categories: ['Violent'] },
      requestId: 'req-s3',
    });

    const result = await client.callTool({
      name: 'fal_classify_text',
      arguments: { text: 'How to build a bomb' },
    });

    const payload = JSON.parse(
      (result.content as Array<{ text: string }>)[0].text,
    );
    expect(payload.safe).toBe(false);
    expect(payload.label).toBe('Unsafe');
    expect(payload.categories).toEqual(['Violent']);
  });

  it('surfaces fal content_policy_violation via parseFalError in the message', async () => {
    mockSubscribe.mockRejectedValue(
      Object.assign(new Error('HTTP 422'), {
        status: 422,
        body: {
          detail: [
            {
              loc: ['body', 'prompt'],
              msg: 'blocked by policy',
              type: 'content_policy_violation',
            },
          ],
        },
        requestId: 'req-blocked',
      }),
    );

    const result = await client.callTool({
      name: 'fal_classify_text',
      arguments: { text: 'some payload' },
    });

    expect(result.isError).toBe(true);
    const text = (result.content as Array<{ text: string }>)[0].text;
    expect(text).toContain('FalContentPolicyViolationError');
    expect(text).toContain('req-blocked');
  });

  it('rejects empty text at the schema layer', async () => {
    const result = await client.callTool({
      name: 'fal_classify_text',
      arguments: { text: '' },
    });
    expect(result.isError).toBe(true);
    expect(mockSubscribe).not.toHaveBeenCalled();
  });
});
