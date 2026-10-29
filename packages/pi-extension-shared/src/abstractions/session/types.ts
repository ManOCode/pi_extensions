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

/**
 * Base class for pi tools to provide common functionality
 * and standardized error handling.
 */
export abstract class BaseTool {
  protected pi?: any;
  abstract name: string;
  abstract label: string;
  abstract description: string;
  abstract parameters: any;

  setPi(pi: any): void {
    this.pi = pi;
  }

  async execute(id: string, args: any): Promise<any> {
    try {
      return await this.run(id, args);
    } catch (error) {
      console.error(`[${this.name}] Error:`, error);
      throw error;
    }
  }

  protected abstract run(id: string, args: any): Promise<any>;

}