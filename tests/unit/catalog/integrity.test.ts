import { describe, it, expect, beforeAll } from 'vitest';
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { registerCoreTools } from '../../../src/core/index.js';
import { registerTextTools } from '../../../src/text/index.js';
import { registerCompositingTools } from '../../../src/compositing/index.js';
import { registerColorTools } from '../../../src/color/index.js';
import { registerContentTools } from '../../../src/content/index.js';
import { registerSocialTools } from '../../../src/social/index.js';
import { registerAdTools } from '../../../src/ads/index.js';
import { registerAssetTools } from '../../../src/assets/index.js';
import { registerStorageTools } from '../../../src/storage/index.js';
import { registerVideoTools } from '../../../src/video/index.js';
import { registerAudioTools } from '../../../src/audio/index.js';
import { registerGenerationTools } from '../../../src/generation/index.js';
import { registerGuideTools } from '../../../src/guides/index.js';
import { registerWorkflowTools } from '../../../src/workflows/index.js';
import { registerCatalogTools } from '../../../src/catalog/catalog.js';
import { isToolRegistered } from '../../../src/catalog/tool-registry.js';

// Guards against catalog drift: every prompt_guide and access_route.tool
// reference in the committed models.json must resolve to either (a) a
// tool actually registered by the production server boot path, or (b) a
// stub route (prompt_guide may be null only for safety capability per
// the design contract). Failing either rule breaks the build.

const CAPABILITIES = ['video', 'image', 'music', 'speech', 'safety'] as const;

const __dirname = dirname(fileURLToPath(import.meta.url));
const MODELS_PATH = resolve(__dirname, '../../../src/catalog/models.json');

interface AccessRoute {
  provider: string;
  tool: string;
  model: string;
  cost: string;
  key_env_var: string;
  stub: boolean;
}

interface CatalogEntry {
  slug: string;
  prompt_guide: string | null;
  access_routes: AccessRoute[];
}

interface CatalogData {
  [capability: string]: Record<string, CatalogEntry[]> | unknown;
}

describe('catalog integrity', () => {
  let data: CatalogData;

  beforeAll(async () => {
    // Boot a full server so every register* call fires and the tool
    // registry reflects the real production surface.
    const server = new McpServer({
      name: 'catalog-integrity-test',
      version: '0.0.0',
    });
    registerCoreTools(server);
    registerTextTools(server);
    registerCompositingTools(server);
    registerColorTools(server);
    registerContentTools(server);
    registerSocialTools(server);
    registerAdTools(server);
    registerAssetTools(server);
    registerStorageTools(server);
    registerVideoTools(server);
    registerAudioTools(server);
    registerGenerationTools(server);
    registerGuideTools(server);
    registerWorkflowTools(server);
    registerCatalogTools(server);

    // Connect + disconnect the server so the SDK's own bookkeeping has
    // run — protects against future SDK changes that lazy-register.
    const client = new Client({ name: 'it', version: '0.0.0' });
    const [ct, st] = InMemoryTransport.createLinkedPair();
    await server.connect(st);
    await client.connect(ct);
    await client.close();
    await server.close();

    const text = await readFile(MODELS_PATH, 'utf8');
    data = JSON.parse(text) as CatalogData;
  });

  it('every prompt_guide points to a registered tool (or is null for safety entries)', () => {
    for (const cap of CAPABILITIES) {
      const capData = data[cap];
      if (!capData || typeof capData !== 'object') continue;
      for (const [subClass, entries] of Object.entries(
        capData as Record<string, CatalogEntry[]>,
      )) {
        for (const entry of entries) {
          if (entry.prompt_guide === null) {
            // Null prompt_guide is only valid on safety entries
            expect(cap, `${subClass}/${entry.slug}: null prompt_guide on non-safety capability`).toBe(
              'safety',
            );
            continue;
          }
          expect(
            isToolRegistered(entry.prompt_guide),
            `${cap}/${subClass}/${entry.slug}: prompt_guide "${entry.prompt_guide}" not registered`,
          ).toBe(true);
        }
      }
    }
  });

  it('every non-stub access_route.tool points to a registered tool', () => {
    for (const cap of CAPABILITIES) {
      const capData = data[cap];
      if (!capData || typeof capData !== 'object') continue;
      for (const [subClass, entries] of Object.entries(
        capData as Record<string, CatalogEntry[]>,
      )) {
        for (const entry of entries) {
          for (const route of entry.access_routes) {
            if (route.stub) continue;
            expect(
              isToolRegistered(route.tool),
              `${cap}/${subClass}/${entry.slug}: non-stub route points at unregistered tool "${route.tool}"`,
            ).toBe(true);
          }
        }
      }
    }
  });

  it('every access route has both a key_env_var and a cost string', () => {
    for (const cap of CAPABILITIES) {
      const capData = data[cap];
      if (!capData || typeof capData !== 'object') continue;
      for (const [subClass, entries] of Object.entries(
        capData as Record<string, CatalogEntry[]>,
      )) {
        for (const entry of entries) {
          for (const route of entry.access_routes) {
            expect(
              typeof route.key_env_var,
              `${cap}/${subClass}/${entry.slug}: route missing key_env_var`,
            ).toBe('string');
            expect(
              route.key_env_var.length,
              `${cap}/${subClass}/${entry.slug}: empty key_env_var`,
            ).toBeGreaterThan(0);
            expect(
              typeof route.cost,
              `${cap}/${subClass}/${entry.slug}: route missing cost`,
            ).toBe('string');
            expect(
              route.cost.length,
              `${cap}/${subClass}/${entry.slug}: empty cost string`,
            ).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  it('every slug is unique within its capability+sub-class bucket', () => {
    for (const cap of CAPABILITIES) {
      const capData = data[cap];
      if (!capData || typeof capData !== 'object') continue;
      for (const [subClass, entries] of Object.entries(
        capData as Record<string, CatalogEntry[]>,
      )) {
        const seen = new Set<string>();
        for (const entry of entries) {
          expect(
            seen.has(entry.slug),
            `${cap}/${subClass}: duplicate slug "${entry.slug}"`,
          ).toBe(false);
          seen.add(entry.slug);
        }
      }
    }
  });
});
