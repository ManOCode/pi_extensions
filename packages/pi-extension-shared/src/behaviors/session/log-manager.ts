import { createLogger, LogLevel, ILogger } from "../../behaviors/log/log-manager.js";

let instance: ILogger | null = null;

export function getLogger(): ILogger {
  if (!instance) {
    instance = createLogger({
        level: LogLevel.WARN
    });
  }
  return instance;
}