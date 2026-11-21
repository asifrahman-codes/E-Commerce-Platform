const isProduction = process.env.NODE_ENV === "production";
const logLevels = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};
const configuredLevel = process.env.LOG_LEVEL?.toLowerCase();
const minimumLevel =
  logLevels[configuredLevel] ?? (isProduction ? logLevels.info : logLevels.debug);

function write(level, message, meta = {}) {
  if (logLevels[level] < minimumLevel) return;

  const entry = {
    ...meta,
    timestamp: new Date().toISOString(),
    level,
    message,
  };

  const output = JSON.stringify(entry);

  if (level === "error") {
    console.error(output);
  } else if (level === "warn") {
    console.warn(output);
  } else {
    console.log(output);
  }
}

export const logger = {
  info(message, meta) {
    write("info", message, meta);
  },

  warn(message, meta) {
    write("warn", message, meta);
  },

  error(message, meta) {
    write("error", message, meta);
  },

  debug(message, meta) {
    write("debug", message, meta);
  },
};