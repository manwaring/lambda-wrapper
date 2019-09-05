import { logger } from './log';
import { isRunningInAwsLambdaEnvironment } from './environment';

export class Metrics {
  private tagger;
  constructor(private type: string) {
    this.tagger = new Tagger();
  }

  common(payload): void {
    const { REVISION, STAGE, AWS_REGION } = process.env;
    logger.debug(`Received ${this.type} event payload`, payload);
    this.tagAndLog('region', AWS_REGION);
    this.tagAndLog('revision', REVISION);
    this.tagAndLog('stage', STAGE);
    this.tagOnly('payload', payload);
  }

  success(response?: any): void {
    logger.debug(`Successfully processed ${this.type} event, responding with`, response);
    this.tagAndLog('success', response);
  }

  valid(response?: any): void {
    logger.debug(`Valid ${this.type} event, responding with`, response);
    this.tagAndLog('valid', response);
  }

  invalid(response?: any): void {
    logger.debug(`Invalid ${this.type} event, responding with`, response);
    this.tagAndLog('invalid', response);
  }

  redirect(response?: any): void {
    logger.debug(`Redirecting ${this.type} event, responding with`, response);
    this.tagAndLog('redirect', response);
  }

  error(response?: any): void {
    logger.debug(`Error processing ${this.type} event, responding with`, response);
    this.tagAndLog('error', response);
  }

  failure(response?: any): void {
    logger.debug(`Failure processing ${this.type} event, responding with`, response);
    this.tagAndLog('failure', response);
  }

  private tagAndLog(key: string, value: any = false): void {
    this.tagger.tagAndLog(key, value);
  }

  private tagOnly(key: string, value: any = false): void {
    this.tagger.tagOnly(key, value);
  }
}

class Tagger {
  isEpsagonInstalled: boolean;
  isIOPipeInstalled: boolean;
  metric: Function;
  label: Function;

  constructor() {
    try {
      const epsagon = require('epsagon');
      this.isEpsagonInstalled = true;
      this.label = epsagon.label;
    } catch (err) {
      logger.debug('Epsagon not installed in project, not tagging with Epsagon labels');
    }
    try {
      const iopipe = require('@iopipe/iopipe');
      this.isIOPipeInstalled = true;
      this.metric = iopipe.metric;
      this.label = iopipe.label;
    } catch (err) {
      logger.debug('IOPipe not installed in project, not tagging with IOPipe metrics');
    }
  }

  tagOnly(key: string, value: any = false): void {
    if (this.isEpsagonInstalled && isRunningInAwsLambdaEnvironment) {
      this.label(key);
    }
    if (this.isIOPipeInstalled && isRunningInAwsLambdaEnvironment) {
      this.isValidMetric(value) ? this.metric(key, value) : this.label(key);
    }
  }

  tagAndLog(key: string, value: any = false): void {
    this.tagOnly(key, value);
    logger.log(key, value);
  }

  private isValidMetric(value: any): boolean {
    const MAX_VALUE_SIZE = 1024;
    return value && JSON.stringify(value).length < MAX_VALUE_SIZE;
  }
}
