import { LogLevel, LogTransport, Logger, ILogger } from "../../abstractions/log/logger.js";
import { ConsoleTransport } from "../../clients/log/console-transport.js";
import { FileTransport } from "../../clients/log/file-transport.js";

let loggerInstance: ILogger | null = null;


export function getLogger(level: LogLevel, options: {
  context?: Record<string, any>;
} = {}): ILogger {
  if (!loggerInstance) {
    loggerInstance = new Logger({
      minLevel: level,
      defaultContext: options.context,
    });
  }
  return loggerInstance;
}

export { LogLevel, ILogger };