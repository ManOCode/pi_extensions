import { createLogger, LogLevel, ILogger } from "@manocode/pi-extension-logger";

let instance: ILogger | null = null;

export function getLogger(): ILogger {
  if (!instance) {
    instance = createLogger({
        level: LogLevel.WARN
    });
  }
  return instance;
}