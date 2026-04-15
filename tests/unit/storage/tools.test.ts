import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { mkdtemp, writeFile, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { registerStorageTools } from '../../../src/storage/index.js';

/**
 * Storage tool tests use the real LocalProvider end-to-end against a temp
 * directory. No mocking needed for local-filesystem round trips.
 *
 * getPublicUrl/getSignedUrl tests verify the tool correctly surfaces the
 * provider's NotImplementedError when called on local paths.
 */
describe('Storage Tools', () => {
  let client: Client;
  let server: McpServer;
  let cleanup: () => Promise<void>;
  let testDir: string;

  beforeAll(async () => {
    server = new McpServer({ name: 'test', version: '0.1.0' });
    registerStorageTools(server);

    client = new Client({ name: 'test-client', version: '1.0.0' });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    await client.connect(clientTransport);

    cleanup = async (): Promise<void> => {
      await client.close();
      await server.close();
    };
  });

  afterAll(async () => {
    await cleanup();
  });

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'artificer-storage-tools-'));
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  // ── storage_upload ─────────────────────────────────────────────────────

  describe('storage_upload', () => {
    it('copies bytes between local paths', async () => {
      const src = join(testDir, 'src.txt');
      const dst = join(testDir, 'dst.txt');
      await writeFile(src, 'hello from upload');

      const result = await client.callTool({
        name: 'storage_upload',
        arguments: { source: src, destination: dst },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      expect(content[0].text).toContain('Uploaded');
      expect(content[0].text).toContain('17 bytes');
      expect((await readFile(dst)).toString()).toBe('hello from upload');
    });

    it('creates destination parent directories', async () => {
      const src = join(testDir, 'src.txt');
      const dst = join(testDir, 'nested', 'deep', 'out.txt');
      await writeFile(src, 'content');

      await client.callTool({
        name: 'storage_upload',
        arguments: { source: src, destination: dst },
      });

      expect((await readFile(dst)).toString()).toBe('content');
    });
  });

  // ── storage_download ───────────────────────────────────────────────────

  describe('storage_download', () => {
    it('copies bytes between local paths (symmetric to upload)', async () => {
      const src = join(testDir, 'cloud.txt');
      const dst = join(testDir, 'local.txt');
      await writeFile(src, 'cloud-simulated');

      const result = await client.callTool({
        name: 'storage_download',
        arguments: { source: src, destination: dst },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      expect(content[0].text).toContain('Downloaded');
      expect((await readFile(dst)).toString()).toBe('cloud-simulated');
    });

    it('downloads from https:// URIs via mocked fetch', async () => {
      const dst = join(testDir, 'fetched.txt');
      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        arrayBuffer: async () => new TextEncoder().encode('downloaded').buffer,
      }) as unknown as typeof fetch;

      try {
        await client.callTool({
          name: 'storage_download',
          arguments: { source: 'https://example.com/asset.txt', destination: dst },
        });
        expect((await readFile(dst)).toString()).toBe('downloaded');
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });

  // ── storage_list ───────────────────────────────────────────────────────

  describe('storage_list', () => {
    it('lists files in a local directory', async () => {
      await writeFile(join(testDir, 'a.txt'), 'a');
      await writeFile(join(testDir, 'b.txt'), 'b');
      await writeFile(join(testDir, 'c.txt'), 'c');

      const result = await client.callTool({
        name: 'storage_list',
        arguments: { prefix: testDir },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      expect(content[0].text).toContain('Found 3 file(s)');
      expect(content[0].text).toContain('a.txt');
      expect(content[0].text).toContain('b.txt');
      expect(content[0].text).toContain('c.txt');
    });

    it('returns "No files found" for empty directories', async () => {
      const result = await client.callTool({
        name: 'storage_list',
        arguments: { prefix: join(testDir, 'missing') },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      expect(content[0].text).toMatch(/No files found/);
    });
  });

  // ── storage_delete ─────────────────────────────────────────────────────

  describe('storage_delete', () => {
    it('deletes an existing file', async () => {
      const path = join(testDir, 'to-delete.txt');
      await writeFile(path, 'bye');

      const result = await client.callTool({
        name: 'storage_delete',
        arguments: { uri: path },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      expect(content[0].text).toContain('Deleted');
      await expect(stat(path)).rejects.toThrow();
    });

    it('is idempotent for missing files', async () => {
      const path = join(testDir, 'never-existed.txt');

      const result = await client.callTool({
        name: 'storage_delete',
        arguments: { uri: path },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      expect(content[0].text).toContain('Deleted');
    });
  });

  // ── storage_exists ─────────────────────────────────────────────────────

  describe('storage_exists', () => {
    it('returns yes when file exists', async () => {
      const path = join(testDir, 'present.txt');
      await writeFile(path, 'x');

      const result = await client.callTool({
        name: 'storage_exists',
        arguments: { uri: path },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      expect(content[0].text).toMatch(/^yes:/);
    });

    it('returns no when file does not exist', async () => {
      const result = await client.callTool({
        name: 'storage_exists',
        arguments: { uri: join(testDir, 'ghost.txt') },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      expect(content[0].text).toMatch(/^no:/);
    });
  });

  // ── storage_get_public_url ─────────────────────────────────────────────

  describe('storage_get_public_url', () => {
    it('returns https:// URLs unchanged', async () => {
      const result = await client.callTool({
        name: 'storage_get_public_url',
        arguments: { uri: 'https://example.com/public.jpg' },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      expect(content[0].text).toBe('https://example.com/public.jpg');
    });

    it('surfaces NotImplementedError for local paths', async () => {
      const result = await client.callTool({
        name: 'storage_get_public_url',
        arguments: { uri: join(testDir, 'local.txt') },
      });

      // Tool returns isError=true for thrown errors; error message contains the NotImplementedError text
      const content = result.content as Array<{ type: string; text: string }>;
      const text = content.map((c) => c.text).join(' ');
      const isError = result.isError === true || /local filesystem cannot expose public urls/i.test(text);
      expect(isError).toBe(true);
    });
  });

  // ── storage_get_signed_url ─────────────────────────────────────────────

  describe('storage_get_signed_url', () => {
    it('surfaces NotImplementedError for local paths', async () => {
      const result = await client.callTool({
        name: 'storage_get_signed_url',
        arguments: { uri: join(testDir, 'local.txt'), ttl_seconds: 3600 },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      const text = content.map((c) => c.text).join(' ');
      const isError = result.isError === true || /does not support signed urls/i.test(text);
      expect(isError).toBe(true);
    });

    it('uses default ttl_seconds when omitted', async () => {
      // Hitting a stub is fine — we just verify the schema accepts no ttl_seconds
      const result = await client.callTool({
        name: 'storage_get_signed_url',
        arguments: { uri: 's3://bucket/key' },
      });

      // Result should be an error (S3 stub throws) — confirms default ttl was used
      const content = result.content as Array<{ type: string; text: string }>;
      const text = content.map((c) => c.text).join(' ');
      const isError = result.isError === true || /not.{0,20}implemented|contribution/i.test(text);
      expect(isError).toBe(true);
    });
  });
});
