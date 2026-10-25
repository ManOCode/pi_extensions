import { PI_EXTENSIONS_ROOT, ensureDirectory } from "@manocode/pi-extension-core";
import { Logger, LogLevel } from "./core/logger.js";
import { ConsoleTransport } from "./infra/console-transport.js";
import { FileTransport } from "./infra/file-transport.js";
import { LogTransport } from "./core/types.js";
import path from "node:path";

let instance: Logger | null = null;

export function createLogger(options: {
  level?: LogLevel;
  context?: Record<string, any>;
} = {}) {
  const transports: LogTransport[] = [new ConsoleTransport()];

  // Automatically determine log file path:
  // PI_EXTENSIONS_ROOT/logs/CWD(as folder name)/DD-MM-YYYY-log.md
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const logFilePath = path.join(PI_EXTENSIONS_ROOT, "logs", `${day}-${month}-${year}.md`);

  transports.push(new FileTransport({ 
    filePath: logFilePath 
  }));

  return new Logger({
    minLevel: options.level,
    defaultContext: options.context,
  }, transports);
}

export function getLogger(options: {
  level?: LogLevel;
  context?: Record<string, any>;
}): Logger {
  if (!instance) {
    instance = createLogger(options);
  }
  return instance;
}

export { Logger, LogLevel };
