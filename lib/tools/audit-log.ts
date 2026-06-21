import { ToolResult, ToolName } from '@/lib/types'

function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36) }

export function logTool(
  agentRunId: string,
  toolName: ToolName,
  inputSummary: string,
  result: { success: boolean; outputSummary?: string; sourceUrls?: string[]; error?: string }
): ToolResult {
  const entry: ToolResult = {
    id: uid(),
    agentRunId,
    toolName,
    status: result.success ? 'success' : 'failed',
    inputSummary,
    outputSummary: result.outputSummary,
    sourceUrls: result.sourceUrls,
    error: result.error,
    timestamp: new Date().toISOString(),
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Tool:${toolName}] ${entry.status} — ${inputSummary}`)
  }

  return entry
}
