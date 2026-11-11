import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { recordToolRegistration } from '../catalog/tool-registry.js';

/** MCP tool handler return type */
export interface ToolResult {
  content: { type: 'text'; text: string }[];
}

/**
 * The parts of the SDK's per-request `extra` that handlers use. Declared
 * here rather than imported so tsc does not resolve the SDK's request
 * generics (see below).
 */
export interface ToolExtra {
  /** Aborted when the client cancels the call. */
  signal?: AbortSignal;
  _meta?: { progressToken?: string | number };
  sendNotification?: (notification: {
    method: string;
    params?: Record<string, unknown>;
  }) => Promise<void>;
}

/**
 * Type-erased wrapper around server.tool() to prevent tsc from resolving
 * Zod's deeply nested generics across 57 tool registrations, which causes OOM.
 *
 * Type safety is preserved via explicit param interfaces on each handler.
 * Runtime validation is preserved via Zod schemas passed as the shape argument.
 * The only thing skipped is tsc validating the Zod schema against the SDK's generic constraint.
 *
 * Also records the registration with the catalog's tool registry so
 * `model_catalog` can filter entries against tools that actually shipped.
 */
export function registerTool<TParams>(
  server: McpServer,
  name: string,
  description: string,
  schema: Record<string, unknown>,
  handler: (params: TParams, extra: ToolExtra) => Promise<ToolResult>,
): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (server as any).tool(name, description, schema, handler);
  recordToolRegistration(name);
}
