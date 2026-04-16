import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { registerGuideTools } from '../../../src/guides/index.js';

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
});
