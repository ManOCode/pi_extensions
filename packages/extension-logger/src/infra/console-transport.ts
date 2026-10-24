import { LogEntry, LogTransport, LogLevelName } from "../core/types.js";

export class ConsoleTransport implements LogTransport {
  private readonly colors = {
    [LogLevelName[0]]: "\x1b[36m", // DEBUG: Cyan
    [LogLevelName[1]]: "\x1b[32m", // INFO: Green
    [LogLevelName[2]]: "\x1b[33m", // WARN: Yellow
    [LogLevelName[3]]: "\x1b[31m", // ERROR: Red
    [LogLevelName[4]]: "\x1b[35m", // FATAL: Magenta
    reset: "\x1b[0m",
  };

  log(entry: LogEntry): void {
    const { timestamp, level, message, context, error } = entry;
    const levelName = LogLevelName[level];
    const color = this.colors[levelName] || this.colors.reset;

    const timeStr = timestamp.toISOString();
    const contextStr = context && Object.keys(context).length > 0 
      ? ` ${JSON.stringify(context)}` 
      : "";

    console.log(`${color}[${timeStr}] [${levelName}]${this.colors.reset} ${message}${contextStr}`);

    if (error) {
      console.error(error);
    }
  }
}
