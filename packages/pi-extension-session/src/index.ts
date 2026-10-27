import { BaseTool } from "@manocode/pi-extension-core";
import { getLogger } from "./behaviors/log-manager";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

const ROOT_DIR = path.join(os.homedir(), ".pi-extensions");
const SESSION_DIR = path.join(ROOT_DIR, "sessions");

const logger = getLogger();

interface ToolExecutionRecord {
  toolCallId: string;
  toolName: string;
  arguments: any;
  result?: any;
  startTime: number;
  endTime?: number;
  durationMs?: number;
  status: "pending" | "success" | "error";
  error?: any;
}

export class SessionManager {
  private static activeCalls = new Map<string, ToolExecutionRecord>();

  private static async ensureSessionDir() {
    try {
      await fs.mkdir(SESSION_DIR, { recursive: true });
    } catch (error) {
      logger.error("Failed to create session directory", { SESSION_DIR }, error as Error);
      throw error;
    }
  }

  private static async persistRecord(sessionId: string, record: ToolExecutionRecord) {
    try {
      await this.ensureSessionDir();
      const filePath = path.join(SESSION_DIR, `${sessionId}.jsonl`);
      await fs.appendFile(filePath, JSON.stringify(record) + "\n", "utf8");
    } catch (error) {
      logger.error("Failed to persist tool record", { sessionId, toolCallId: record.toolCallId }, error as Error);
    }
  }

  static async recordStart(toolCallId: string, toolName: string, args: any) {
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

  static async recordResult(toolCallId: string, result: any) {
    const record = this.activeCalls.get(toolCallId);
    if (record) {
      record.result = result;
      logger.debug("Session capture: tool result", { toolCallId });
    }
  }

  static async recordEnd(toolCallId: string, isError: boolean, error?: any) {
    const record = this.activeCalls.get(toolCallId);
    if (record) {
      record.endTime = Date.now();
      record.durationMs = record.endTime - record.startTime;
      record.status = isError ? "error" : "success";
      if (isError) {
        record.error = error;
      }

      const sessionId = process.env.PI_SESSION_ID || "unknown-session";
      await this.persistRecord(sessionId, record);
      logger.debug("Session capture: tool end", { toolCallId, sessionId });
      this.activeCalls.delete(toolCallId);
    }
  }
}

/**
 * Base tool that automatically records its execution to the session logs.
 */
export abstract class SessionableBaseTool extends BaseTool {
  async execute(id: string, args: any): Promise<any> {
    await SessionManager.recordStart(id, this.name, args);
    let isError = false;
    let errorDetails: any;
    try {
      const result = await this.run(id, args);
      await SessionManager.recordResult(id, result);
      return result;
    } catch (error: any) {
      isError = true;
      errorDetails = error;
      throw error;
    } finally {
      await SessionManager.recordEnd(id, isError, errorDetails);
    }
  }

  // Re-implementing execute for better finally block handling
}
