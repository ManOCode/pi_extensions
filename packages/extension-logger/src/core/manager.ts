import { Logger, LogLevel } from "./logger.js";
import { ConsoleTransport } from "../log/infra/console-transport.js";
import { FileTransport } from "../log/infra/file-transport.js";
import path from "node:path";

let instance: Logger | null = null;

export function createLogger(options: {
  level?: LogLevel;
  logFile?: string;
  context?: Record<string, any>;
} = {}) {
  const transports = [new ConsoleTransport()];
  
  if (options.logFile) {
    transports.push(new FileTransport({ 
      filePath: options.logFile || path.join(process.cwd(), "logs/app.log") 
    }));
  }

  return new Logger({
    minLevel: options.level,
    defaultContext: options.context,
  }, transports);
}

export function getLogger(): Logger {
  if (!instance) {
    // Default configuration
    instance = createLogger({
      level: LogLevel.DEBUG,
      logFile: path.join(process.cwd(), "logs/memory.log"),
    });
  }
  return instance;
}
