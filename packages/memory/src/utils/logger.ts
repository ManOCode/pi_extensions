import * as fs from "node:fs/promises";
import * as path from "node:path";
import { LOG_DIR, ensureLogDir } from "../constants/directory_constant.js";

export async function logToolExecution(toolName: string, params: any, result: any, error?: any) {
  await ensureLogDir();
  const logFilePath = path.join(LOG_DIR, "tools.jsonl");
  const logEntry = {
    timestamp: new Date().toISOString(),
    tool: toolName,
    params,
    result,
    error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
  };
  await fs.appendFile(logFilePath, JSON.stringify(logEntry) + "\n", "utf8");
}
