import { LogLevel, LogTransport, Logger, ILogger,  } from "../../abstractions/log/logger.js";
import { ConsoleTransport } from "../../clients/log/console-transport.js";
import { FileTransport } from "../../clients/log/file-transport.js";
import path from "node:path";
import os from "node:os";

const PI_EXTENSIONS_ROOT = path.join(os.homedir(), ".pi-extensions");

let loggerInstance: ILogger | null = null;

export function createLogger(options: {
  level?: LogLevel;
  context?: Record<string, any>;
  logFile?: string;
} = {}):ILogger {
  const transports: LogTransport[] = [new ConsoleTransport()];

  // Automatically determine log file path if not provided:
  let logFilePath: string;
  if (options.logFile) {
    logFilePath = options.logFile;
  } else {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    logFilePath = path.join(PI_EXTENSIONS_ROOT, "logs", `${day}-${month}-${year}.md`);
  }

  transports.push(new FileTransport({ 
    filePath: logFilePath 
  }));

  return new Logger({
    minLevel: options.level,
    defaultContext: options.context,
  }, transports);
}

export function getLogger(logLevel: LogLevel): ILogger {
  if (!loggerInstance) {
    loggerInstance = createLogger({
      level: logLevel
    });
  }
  return loggerInstance;
}

export { LogLevel, ILogger };