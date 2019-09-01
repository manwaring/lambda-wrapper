import { logger } from './log';
import { isRunningInAwsLambdaEnvironment } from './environment';

export class Metrics {
  private tagger;
  constructor(private type: string) {
    this.tagger = new Tagger(type);
  }

  common(payload): void {
    const { REVISION, STAGE, AWS_REGION } = process.env;
    logger.debug(`Received ${this.type} event payload`, payload);
    this.tag('region', AWS_REGION);
    this.tag('revision', REVISION);
    this.tag('stage', STAGE);
    this.tag('payload', payload);
  }

  success(response?: any): void {
    logger.debug(`Successfully processed ${this.type} event, responding with`, response);
    this.tag('success', response);
  }

  valid(response?: any): void {
    logger.debug(`Valid ${this.type} event, responding with`, response);
    this.tag('valid', response);
  }

  invalid(response?: any): void {
    logger.debug(`Invalid ${this.type} event, responding with`, response);
    this.tag('invalid', response);
  }

  redirect(response?: any): void {
    logger.debug(`Redirecting ${this.type} event, responding with`, response);
    this.tag('redirect', response);
  }

  error(response?: any): void {
    logger.debug(`Error processing ${this.type} event, responding with`, response);
    this.tag('error', response);
  }

  failure(response?: any): void {
    logger.debug(`Failure processing ${this.type} event, responding with`, response);
    this.tag('failure', response);
  }

  private tag(key: string, value: any = false): void {
    this.tagger.tag(key, value);
  }
}

class Tagger {
  isEpsagonInstalled: boolean;
  isIOPipeInstalled: boolean;
  metric: Function;
  label: Function;

  constructor(private type: string) {
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

  tag(key: string, value: any = false): void {
    if (this.isEpsagonInstalled && isRunningInAwsLambdaEnvironment) {
      this.label(key);
    }
    if (this.isIOPipeInstalled && isRunningInAwsLambdaEnvironment) {
      this.isValidMetric(value) ? this.metric(key, value) : this.label(key);
    }
    logger.log(key, value);
  }

  private isValidMetric(value: any): boolean {
    const MAX_VALUE_SIZE = 1024;
    return value && JSON.stringify(value).length < MAX_VALUE_SIZE;
  }
}
