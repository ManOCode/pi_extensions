export interface ISessionClient {
  ensureDirectory(): Promise<Result<void>>;
  appendLog(sessionId: string, data: string): Promise<Result<void>>;
}

export interface ISessionManager {
  recordStart(toolCallId: string, toolName: string, args: unknown): Promise<void>;
  recordResult(toolCallId: string, result: unknown): Promise<void>;
  recordEnd(toolCallId: string, isError: boolean, error?: unknown): Promise<Result<void>>;
}

export type Result<T, E = Error> = 
  | { success: true; data: T } 
  | { success: false; error: E };

export interface ToolExecutionRecord {
  toolCallId: string;
  toolName: string;
  arguments: unknown;
  result?: unknown;
  startTime: number;
  endTime?: number;
  durationMs?: number;
  status: "pending" | "success" | "error";
  error?: unknown;
}
