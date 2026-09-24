#!/usr/bin/env node
// @ts-check

/**
 * Turn a prompt-guide markdown file into a registered guide module in
 * src/guides/, in the same shape as the hand-written guides (a template
 * literal constant plus a register function).
 *
 * Usage:
 *   node scripts/guide-from-markdown.mjs <guide.md> <tool_name> "<description>" [out.ts]
 *
 * The default output path is src/guides/<tool-name-with-dashes>.ts.
 * Registering it in src/guides/index.ts is left to the caller.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Escape markdown for a JS template literal. */
function toTemplateLiteral(md) {
  return md.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

/** fal_image_edit_prompt_guide → FalImageEditPromptGuide */
function pascal(name) {
  return name
    .split('_')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');
}

async function main() {
  const [mdPath, toolName, description, outArg] = process.argv.slice(2);
  if (!mdPath || !toolName || !description) {
    console.error('usage: node scripts/guide-from-markdown.mjs <guide.md> <tool_name> "<description>" [out.ts]');
    process.exit(2);
  }
  if (!/^[a-z0-9_]+$/.test(toolName)) throw new Error(`tool name must be snake_case: ${toolName}`);

  const md = (await readFile(mdPath, 'utf8')).trim() + '\n';
  const constName = toolName.replace(/_prompt_guide$|_guide$/, '').toUpperCase() + '_GUIDE';
  const fnName = `register${pascal(toolName)}`;
  const out =
    outArg ?? resolve(__dirname, '..', 'src/guides', `${toolName.replace(/_prompt_guide$/, '').replace(/_/g, '-')}.ts`);

  const source = `import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const ${constName} = \`${toTemplateLiteral(md)}\`;

export function ${fnName}(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    '${toolName}',
    ${JSON.stringify(description)},
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: ${constName} }] }),
  );
}
`;
  await writeFile(out, source);
  console.log(`${out}\n  export: ${fnName}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
