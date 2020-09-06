import { logger } from './log';

export class Metrics {
  constructor(private type: string) {}

  common(parsed: any, original?: any): void {
    const { REVISION, STAGE, AWS_REGION } = process.env;
    const payload = original ? { original, parsed } : parsed;
    logger.debug(`Received ${this.type} event payload`, payload);
    if (AWS_REGION) {
      logger.info('region', AWS_REGION);
    }
    if (REVISION) {
      logger.info('revision', REVISION);
    }
    if (STAGE) {
      logger.info('stage', STAGE);
    }
  }

  success(response?: any): void {
    logger.debug(`Successfully processed ${this.type} event, responding with`, response);
  }

  valid(response?: any): void {
    logger.debug(`Valid ${this.type} event, responding with`, response);
  }

  invalid(response?: any): void {
    logger.debug(`Invalid ${this.type} event, responding with`, response);
  }

  notFound(response?: any): void {
    logger.debug(`Unable to find record for ${this.type} event, responding with`, response);
  }

  redirect(response?: any): void {
    logger.debug(`Redirecting ${this.type} event, responding with`, response);
  }

  error(response?: any): void {
    logger.debug(`Error processing ${this.type} event, responding with`, response);
  }

  failure(response?: any): void {
    logger.debug(`Failure processing ${this.type} event, responding with`, response);
  }
}
