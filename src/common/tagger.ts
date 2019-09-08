import { logger } from './log';
import { isRunningInAwsLambdaEnvironment } from './environment';

class Tagger {
  private epsagon: TaggingLibrary = { installed: false };
  private iopipe: TaggingLibrary = { installed: false };

  constructor() {
    try {
      const epsagon = require('epsagon');
      this.epsagon.installed = true;
      this.epsagon.label = epsagon.label;
    } catch (err) {
      logger.debug('Epsagon not installed in project, not tagging with Epsagon labels');
    }
    try {
      const iopipe = require('@iopipe/iopipe');
      this.iopipe.installed = true;
      this.iopipe.metric = iopipe.metric;
      this.iopipe.label = iopipe.label;
    } catch (err) {
      logger.debug('IOPipe not installed in project, not tagging with IOPipe metrics');
    }
  }

  tagOnly(key: string, value?: any): void {
    const isInAWSLambda = isRunningInAwsLambdaEnvironment();
    if (this.epsagon.installed && isInAWSLambda) {
      this.epsagon.label(key);
    }
    if (this.iopipe.installed && isInAWSLambda) {
      this.isValidMetric(value) ? this.iopipe.metric(key, value) : this.iopipe.label(key);
    }
  }

  tagAndLog(key: string, value?: any): void {
    this.tagOnly(key, value);
    value ? logger.log(key, value) : logger.log(key);
  }

  private isValidMetric(value: any): boolean {
    const MAX_VALUE_SIZE = 1024;
    return value && JSON.stringify(value).length < MAX_VALUE_SIZE;
  }
}

export const tagger = new Tagger();

interface TaggingLibrary {
  installed: boolean;
  label?: Function;
  metric?: Function;
}
