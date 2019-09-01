class Log {
  private shouldLog: boolean = process.env.LAMBDA_WRAPPER_LOG && JSON.parse(process.env.LAMBDA_WRAPPER_LOG);
  info(...args) {
    if (this.shouldLog) {
      console.info.apply(this, args);
    }
  }

  debug(...args) {
    if (this.shouldLog) {
      console.debug.apply(this, args);
    }
  }

  log(...args) {
    if (this.shouldLog) {
      console.log.apply(this, args);
    }
  }

  warn(...args) {
    if (this.shouldLog) {
      console.warn.apply(this, args);
    }
  }

  error(...args) {
    if (this.shouldLog) {
      console.error.apply(this, args);
    }
  }
}

export const logger = new Log();
