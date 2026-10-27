export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export const LogLevelName: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: "DEBUG",
  [LogLevel.INFO]: "INFO",
  [LogLevel.WARN]: "WARN",
  [LogLevel.ERROR]: "ERROR",
  [LogLevel.FATAL]: "FATAL",
};

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
}

export interface LogTransport {
  log(entry: LogEntry): Promise<void> | void;
}

export interface ILogger {
  addTransport(transport: LogTransport): void;
  debug(message: string, context?: Record<string, any>): void;
  info(message: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  error(message: string, context?: Record<string, any>, error?: Error): void;
  fatal(message: string, context?: Record<string, any>, error?: Error): void;
}

export interface LoggerOptions {
  minLevel?: LogLevel;
  defaultContext?: Record<string, any>;
}
