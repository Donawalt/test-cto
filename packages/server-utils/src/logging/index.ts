export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: Error;
}

export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, error?: Error, context?: Record<string, unknown>): void;
}

export function createLogger(namespace?: string): Logger {
  const formatLog = (entry: LogEntry): string => {
    const prefix = namespace ? `[${namespace}]` : '';
    const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
    const errorStr = entry.error ? `\n${entry.error.stack}` : '';
    
    return `${entry.timestamp} ${prefix} [${entry.level.toUpperCase()}] ${entry.message}${contextStr}${errorStr}`;
  };

  const log = (level: LogLevel, message: string, error?: Error, context?: Record<string, unknown>) => {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    };

    const formatted = formatLog(entry);

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.ERROR:
        console.error(formatted);
        break;
    }
  };

  return {
    debug: (message: string, context?: Record<string, unknown>) => {
      log(LogLevel.DEBUG, message, undefined, context);
    },
    info: (message: string, context?: Record<string, unknown>) => {
      log(LogLevel.INFO, message, undefined, context);
    },
    warn: (message: string, context?: Record<string, unknown>) => {
      log(LogLevel.WARN, message, undefined, context);
    },
    error: (message: string, error?: Error, context?: Record<string, unknown>) => {
      log(LogLevel.ERROR, message, error, context);
    },
  };
}

export const logger = createLogger();

export function logError(error: Error, context?: Record<string, unknown>): void {
  logger.error(error.message, error, context);
}

export function logInfo(message: string, context?: Record<string, unknown>): void {
  logger.info(message, context);
}

export function logDebug(message: string, context?: Record<string, unknown>): void {
  logger.debug(message, context);
}

export function logWarn(message: string, context?: Record<string, unknown>): void {
  logger.warn(message, context);
}
