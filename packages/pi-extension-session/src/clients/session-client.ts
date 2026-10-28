import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { Result, type ISessionClient } from "../abstractions/types.js";

export class SessionClient implements ISessionClient {
  private readonly sessionDir: string;

  constructor() {
    const rootDir = path.join(os.homedir(), ".pi-extensions");
    this.sessionDir = path.join(rootDir, "sessions");
  }

  async ensureDirectory(): Promise<Result<void>> {
    try {
      await fs.mkdir(this.sessionDir, { recursive: true });
      return { success: true, data: undefined };
    } catch (error: unknown) {
      return { 
        success: false, 
        error: new Error(`Failed to create session directory: ${this.sessionDir}. ${error instanceof Error ? error.message : String(error)}`) 
      };
    }
  }

  async appendLog(sessionId: string, data: string): Promise<Result<void>> {
    try {
      await this.ensureDirectory();
      const filePath = path.join(this.sessionDir, `${sessionId}.jsonl`);
      await fs.appendFile(filePath, data + "\n", "utf8");
      return { success: true, data: undefined };
    } catch (error: unknown) {
      return { 
        success: false, 
        error: new Error(`Failed to append to session log ${sessionId}: ${error instanceof Error ? error.message : String(error)}`) 
      };
    }
  }
}

export const sessionClient:ISessionClient = new SessionClient();
