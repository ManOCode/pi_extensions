import { LogEntry, LogTransport, LogLevelName, LogLevel } from "../../abstractions/log/types.js";

export class ConsoleTransport implements LogTransport {
  private readonly colors = {
    [LogLevelName[LogLevel.DEBUG]]: "\x1b[36m", // DEBUG: Cyan
    [LogLevelName[LogLevel.INFO]]: "\x1b[32m", // INFO: Green
    [LogLevelName[LogLevel.WARN]]: "\x1b[33m", // WARN: Yellow
    [LogLevelName[LogLevel.ERROR]]: "\x1b[31m", // ERROR: Red
    [LogLevelName[LogLevel.FATAL]]: "\x1b[35m", // FATAL: Magenta
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
