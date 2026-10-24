import { LogEntry, LogTransport, LogLevelName } from "../core/types.js";
import fs from "node:fs";
import path from "node:path";

export class FileTransport implements LogTransport {
  private readonly logFilePath: string;
  private readonly maxFileSize: number;

  constructor(options: { filePath: string; maxFileSize?: number }) {
    this.logFilePath = options.filePath;
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
    return JSON.stringify({
      timestamp: entry.timestamp.toISOString(),
      level: LogLevelName[entry.level],
      message: entry.message,
      context: entry.context,
      error: entry.error?.stack || entry.error?.message,
    });
  }

  private rotate(): void {
    const backupPath = `${this.logFilePath}.old`;
    if (fs.existsSync(backupPath)) {
      fs.unlinkSync(backupPath);
    }
    fs.renameSync(this.logFilePath, backupPath);
  }
}
