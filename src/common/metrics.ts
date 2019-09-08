import { logger } from './log';
import { tagger } from './tagger';

export class Metrics {
  constructor(private type: string) {}

  common(payload): void {
    const { REVISION, STAGE, AWS_REGION } = process.env;
    logger.debug(`Received ${this.type} event payload`, payload);
    if (AWS_REGION) {
      tagger.tagAndLog('region', AWS_REGION);
    }
    if (REVISION) {
      tagger.tagAndLog('revision', REVISION);
    }
    if (STAGE) {
      tagger.tagAndLog('stage', STAGE);
    }
    tagger.tagOnly('payload', payload);
  }

  success(response?: any): void {
    logger.debug(`Successfully processed ${this.type} event, responding with`, response);
    tagger.tagOnly('success', response);
  }

  valid(response?: any): void {
    logger.debug(`Valid ${this.type} event, responding with`, response);
    tagger.tagOnly('valid', response);
  }

  invalid(response?: any): void {
    logger.debug(`Invalid ${this.type} event, responding with`, response);
    tagger.tagOnly('invalid', response);
  }

  redirect(response?: any): void {
    logger.debug(`Redirecting ${this.type} event, responding with`, response);
    tagger.tagOnly('redirect', response);
  }

  error(response?: any): void {
    logger.debug(`Error processing ${this.type} event, responding with`, response);
    tagger.tagOnly('error', response);
  }

  failure(response?: any): void {
    logger.debug(`Failure processing ${this.type} event, responding with`, response);
    tagger.tagOnly('failure', response);
  }
}
