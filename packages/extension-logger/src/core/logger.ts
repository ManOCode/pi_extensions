import { LogLevel, LogEntry, LogTransport, LoggerOptions } from "./types.js";

export class Logger {
  private readonly minLevel: LogLevel;
  private readonly defaultContext: Record<string, any>;
  private readonly transports: LogTransport[];

  constructor(options: LoggerOptions = {}, transports: LogTransport[] = []) {
    this.minLevel = options.minLevel ?? LogLevel.DEBUG;
    this.defaultContext = options.defaultContext ?? {};
    this.transports = transports;
  }

  public addTransport(transport: LogTransport): void {
    this.transports.push(transport);
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
    if (level < this.minLevel) return;

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context: { ...this.defaultContext, ...context },
      error,
    };

    for (const transport of this.transports) {
      try {
        transport.log(entry);
      } catch (e) {
        console.error("PiLogger: Transport failed to log", e);
      }
    }
  }

  public debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  public info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  public warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  public error(message: string, context?: Record<string, any>, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  public fatal(message: string, context?: Record<string, any>, error?: Error): void {
    this.log(LogLevel.FATAL, message, context, error);
  }
}

export { LogLevel } from "./types.js";
