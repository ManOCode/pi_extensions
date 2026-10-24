import { Logger, LogLevel } from "./core/logger.js";
import { ConsoleTransport } from "./infra/console-transport.js";
import { FileTransport } from "./infra/file-transport.js";
import { LogTransport } from "./core/types.js";
import path from "node:path";

let instance: Logger | null = null;

export function createLogger(options: {
  level?: LogLevel;
  logFile?: string;
  context?: Record<string, any>;
} = {}) {
  const transports: LogTransport[] = [new ConsoleTransport()];
  
  if (options.logFile) {
    transports.push(new FileTransport({ 
      filePath: options.logFile 
    }));
  }

  return new Logger({
    minLevel: options.level,
    defaultContext: options.context,
  }, transports);
}

export function getLogger(options: {
  level?: LogLevel;
  logFile: string;
  context?: Record<string, any>;
}): Logger {
  if (!instance) {
    instance = createLogger(options);
  }
  return instance;
}

export { Logger, LogLevel };
