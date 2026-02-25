type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'http';

const LOG_COLORS: Record<LogLevel, string> = {
    debug: '\x1b[36m',  // cyan
    info: '\x1b[32m',   // green
    warn: '\x1b[33m',   // yellow
    error: '\x1b[31m',  // red
    http: '\x1b[35m',   // magenta
};

const RESET = '\x1b[0m';

function formatMessage(level: LogLevel, message: string, ...args: unknown[]): string {
    const timestamp = new Date().toISOString();
    const color = LOG_COLORS[level];
    const extra = args.length > 0 ? ' ' + args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' ') : '';
    return `${color}${timestamp} [${level.toUpperCase()}]${RESET}: ${message}${extra}`;
}

export const logger = {
    debug: (message: string, ...args: unknown[]) => {
        if (process.env.NODE_ENV !== 'production') {
            console.debug(formatMessage('debug', message, ...args));
        }
    },
    info: (message: string, ...args: unknown[]) => {
        console.log(formatMessage('info', message, ...args));
    },
    warn: (message: string, ...args: unknown[]) => {
        console.warn(formatMessage('warn', message, ...args));
    },
    error: (message: string, ...args: unknown[]) => {
        console.error(formatMessage('error', message, ...args));
    },
    http: (message: string, ...args: unknown[]) => {
        console.log(formatMessage('http', message, ...args));
    },
};
