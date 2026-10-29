import { createLogger, LogLevel, ILogger } from "@manocode/pi-extension-shared";

let instance: ILogger | null = null;

export function getLogger(): ILogger {
  if (!instance) {
    instance = createLogger({
        level: LogLevel.INFO
    });
  }
  return instance;
}