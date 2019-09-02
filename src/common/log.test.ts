import { logger } from './log';

describe('Logging behavior', () => {
  const ORIGINAL_ENVS = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENVS };
  });

  it("Doesn't log at any level when logging is disabled", () => {
    const levels = ['info', 'debug', 'log', 'warn', 'error'];
    levels.forEach(level => {
      const message = `${level} message`;
      console[level] = jest.fn();
      logger[level](message);
      expect(console[level]).not.toHaveBeenCalled();
    });
  });

  it('Logs at all levels when logging is enabled', () => {
    // Enable logging via environment variable
    const enableLogging = { LAMBDA_WRAPPER_LOG: 'true' };
    process.env = { ...ORIGINAL_ENVS, ...enableLogging };

    const levels = ['info', 'debug', 'log', 'warn', 'error'];
    levels.forEach(level => {
      const message = `${level} message`;
      console[level] = jest.fn();
      logger[level](message);
      expect(console[level]).toHaveBeenCalledWith(message);
    });
  });
});
