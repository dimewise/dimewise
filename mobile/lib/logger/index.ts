type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  context?: string;
  data?: Record<string, unknown>;
}

const formatMessage = (
  level: LogLevel,
  message: string,
  context?: string
): string => {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
  const prefix = context ? `[${context}]` : '';
  const levelEmoji = {
    debug: '🔍',
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌',
  }[level];
  return `${levelEmoji} ${timestamp} ${prefix} ${message}`;
};

export const logger = {
  debug: (message: string, options?: LogOptions) => {
    if (__DEV__) {
      console.log(
        formatMessage('debug', message, options?.context),
        options?.data ?? ''
      );
    }
  },

  info: (message: string, options?: LogOptions) => {
    if (__DEV__) {
      console.info(
        formatMessage('info', message, options?.context),
        options?.data ?? ''
      );
    }
  },

  warn: (message: string, options?: LogOptions) => {
    console.warn(
      formatMessage('warn', message, options?.context),
      options?.data ?? ''
    );
  },

  error: (error: Error | string, options?: LogOptions) => {
    const errorMessage = error instanceof Error ? error.message : error;
    console.error(
      formatMessage('error', errorMessage, options?.context),
      options?.data ?? ''
    );

    // In production, this would send to Sentry
    // if (!__DEV__) {
    //   Sentry.captureException(error);
    // }
  },
};
