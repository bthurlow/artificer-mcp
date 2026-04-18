import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { registerGuideTools } from '../../../src/guides/index.js';
import { resetBrandSpecCache } from '../../../src/brand.js';

describe('Guide Tools', () => {
  let client: Client;
  let server: McpServer;
  let cleanup: () => Promise<void>;

  beforeAll(async () => {
    server = new McpServer({ name: 'test', version: '0.1.0' });
    registerGuideTools(server);

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

  describe('gemini_image_prompt_guide', () => {
    it('returns structured markdown with all sections', async () => {
      const result = await client.callTool({
        name: 'gemini_image_prompt_guide',
        arguments: {},
      });

      const content = result.content as Array<{ type: string; text: string }>;
      const text = content[0].text;

      expect(text).toContain('# Gemini Image Generation');
      expect(text).toContain('## Overview');
      expect(text).toContain('## Prompt Template');
      expect(text).toContain('## Good Examples');
      expect(text).toContain('## Bad Examples');
      expect(text).toContain('## Model-Specific Notes');
      expect(text).toContain('## Official References');
    });
  });

  describe('veo_video_prompt_guide', () => {
    it('returns structured markdown with all sections', async () => {
      const result = await client.callTool({
        name: 'veo_video_prompt_guide',
        arguments: {},
      });

      const content = result.content as Array<{ type: string; text: string }>;
      const text = content[0].text;

      expect(text).toContain('# Veo Video Generation');
      expect(text).toContain('## Overview');
      expect(text).toContain('## Prompt Template');
      expect(text).toContain('## Good Examples');
      expect(text).toContain('## Bad Examples');
      expect(text).toContain('## Image-to-Video Tips');
      expect(text).toContain('## Official References');
    });
  });

  describe('gemini_nanobanana_prompt_guide', () => {
    it('returns structured markdown', async () => {
      const result = await client.callTool({
        name: 'gemini_nanobanana_prompt_guide',
        arguments: {},
      });
      const text = (result.content as Array<{ text: string }>)[0].text;
      expect(text.length).toBeGreaterThan(200);
      expect(text).toMatch(/nano-?banana|gemini-2\.5-flash-image/i);
    });
  });

  describe('gemini_tts_prompt_guide', () => {
    it('returns structured markdown', async () => {
      const result = await client.callTool({
        name: 'gemini_tts_prompt_guide',
        arguments: {},
      });
      const text = (result.content as Array<{ text: string }>)[0].text;
      expect(text.length).toBeGreaterThan(200);
      expect(text.toLowerCase()).toContain('voice');
    });
  });

  describe('gemini_lyria_prompt_guide', () => {
    it('returns structured markdown', async () => {
      const result = await client.callTool({
        name: 'gemini_lyria_prompt_guide',
        arguments: {},
      });
      const text = (result.content as Array<{ text: string }>)[0].text;
      expect(text.length).toBeGreaterThan(200);
      expect(text.toLowerCase()).toContain('lyria');
    });
  });

  describe('brand_spec_get', () => {
    beforeEach(() => {
      resetBrandSpecCache();
      delete process.env.ARTIFICER_BRAND_SPEC;
    });

    it('returns configured:false when env var is unset', async () => {
      const result = await client.callTool({ name: 'brand_spec_get', arguments: {} });
      const text = (result.content as Array<{ text: string }>)[0].text;
      const parsed = JSON.parse(text) as { configured: boolean; hint?: string };
      expect(parsed.configured).toBe(false);
      expect(parsed.hint).toMatch(/ARTIFICER_BRAND_SPEC/);
    });

    it('returns configured:true with parsed spec when env var is set', async () => {
      process.env.ARTIFICER_BRAND_SPEC = JSON.stringify({
        name: 'Acme',
        colors: { primary: '#e11d48' },
      });
      resetBrandSpecCache();
      const result = await client.callTool({ name: 'brand_spec_get', arguments: {} });
      const text = (result.content as Array<{ text: string }>)[0].text;
      const parsed = JSON.parse(text) as {
        configured: boolean;
        spec: { name: string; colors: { primary: string } };
      };
      expect(parsed.configured).toBe(true);
      expect(parsed.spec.name).toBe('Acme');
      expect(parsed.spec.colors.primary).toBe('#e11d48');
    });
  });
});
