import { PI_EXTENSIONS_ROOT } from "@manocode/pi-extension-core";
import { LogLevel, LogTransport, Logger, ILogger,  } from "../abstractions/logger.js";
import { ConsoleTransport } from "../clients/console-transport.js";
import { FileTransport } from "../clients/file-transport.js";
import path from "node:path";

export function createLogger(options: {
  level?: LogLevel;
  context?: Record<string, any>;
} = {}):ILogger {
  const transports: LogTransport[] = [new ConsoleTransport()];

  // Automatically determine log file path:
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

export { LogLevel, ILogger };