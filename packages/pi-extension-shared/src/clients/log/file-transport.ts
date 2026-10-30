import { LogEntry, LogTransport, LogLevelName } from "../../abstractions/log/types.js";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const PI_EXTENSIONS_ROOT = path.join(os.homedir(), ".pi-extensions");

export class FileTransport implements LogTransport {
  private readonly logFilePath: string;
  private readonly maxFileSize: number;

  constructor(options: { maxFileSize?: number }) {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    this.logFilePath = path.join(PI_EXTENSIONS_ROOT, "logs", `${day}-${month}-${year}.md`);
    this.maxFileSize = options.maxFileSize ?? 10 * 1024 * 1024; // 10MB default

    const dir = path.dirname(this.logFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  log(entry: LogEntry): void {
    const logLine = this.format(entry);
    
    // Basic rotation check
    if (fs.existsSync(this.logFilePath)) {
      const stats = fs.statSync(this.logFilePath);
      if (stats.size > this.maxFileSize) {
        this.rotate();
      }
    }

    fs.appendFileSync(this.logFilePath, logLine + "\n");
  }

  private format(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = LogLevelName[entry.level];
    const context = entry.context 
      ? ` ${JSON.stringify(entry.context)}` 
      : "";
    const error = entry.error 
      ? `\n- Error: ${entry.error.stack || entry.error.message}` 
      : "";

    return `[${timestamp}] **${level}**: ${entry.message}${context}${error}`;
  }

  private rotate(): void {
    const backupPath = `${this.logFilePath}.old`;
    if (fs.existsSync(backupPath)) {
      fs.unlinkSync(backupPath);
    }
    fs.renameSync(this.logFilePath, backupPath);
  }
}