import { sessionClient } from "../../clients/session/session-client.js";
import { getLogger } from "./log-manager.js";
import { ToolExecutionRecord, Result, type ISessionManager } from "../../abstractions/session/types.js";

const logger = getLogger();

export class SessionManager implements ISessionManager {
  private readonly activeCalls = new Map<string, ToolExecutionRecord>();

  async recordStart(toolCallId: string, toolName: string, args: any): Promise<void> {
    const record: ToolExecutionRecord = {
      toolCallId,
      toolName,
      arguments: args,
      startTime: Date.now(),
      status: "pending",
    };
    this.activeCalls.set(toolCallId, record);
    logger.debug("Session capture: tool start", { toolCallId, toolName });
  }

  async recordResult(toolCallId: string, result: any): Promise<void> {
    const record = this.activeCalls.get(toolCallId);
    if (record) {
      record.result = result;
      logger.debug("Session capture: tool result", { toolCallId });
    }
  }

  async recordEnd(toolCallId: string, isError: boolean, error?: any): Promise<Result<void>> {
    const record = this.activeCalls.get(toolCallId);
    if (!record) {
      return { success: false, error: new Error(`No active record found for toolCallId: ${toolCallId}`) };
    }

    record.endTime = Date.now();
    record.durationMs = record.endTime - record.startTime;
    record.status = isError ? "error" : "success";
    if (isError) {
      record.error = error;
    }

    const sessionId = process.env.PI_SESSION_ID || "unknown-session";
    const result = await sessionClient.appendLog(sessionId, JSON.stringify(record));
    
    if (result.success) {
      logger.debug("Session capture: tool end", { toolCallId, sessionId });
      this.activeCalls.delete(toolCallId);
    } else {
      logger.error("Session capture: failed to persist record", { toolCallId, sessionId, error: result.error });
    }

    return result;
  }
}

export const sessionManager:ISessionManager = new SessionManager();
