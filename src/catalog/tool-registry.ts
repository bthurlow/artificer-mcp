/**
 * Module-level record of every tool registered via `registerTool`.
 *
 * Exists so `model_catalog` can filter catalog entries against what's
 * actually registered at runtime. Prevents catalog drift from showing
 * callers entries whose transport tools aren't shipping yet.
 *
 * The MCP SDK's own registered-tools map is private on McpServer; rather
 * than reach into it via type-erasure, we keep our own Set and update it
 * from the single choke point (`registerTool`).
 */

const registeredTools = new Set<string>();

/** Record that a tool with this name has been registered. */
export function recordToolRegistration(name: string): void {
  registeredTools.add(name);
}

/** Check whether a tool name has been registered through our wrapper. */
export function isToolRegistered(name: string): boolean {
  return registeredTools.has(name);
}

/** Snapshot of all registered tool names, useful for diagnostics / tests. */
export function listRegisteredTools(): string[] {
  return [...registeredTools].sort();
}
