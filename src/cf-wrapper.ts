import { label, metric } from '@iopipe/iopipe';
import { send, SUCCESS, FAILED } from 'cfn-response';
import { tagCommonMetrics } from './common';

export function cloudFormationWrapper<T extends Function>(fn: T): T {
  return <any>function(event, context, callback) {
    tagCommonMetrics();

    function success(message: any): void {
      label('success');
      console.info('Successfully processed CloudFormation stack event', message);
      return send(event, context, SUCCESS);
    }

    function failure(message: any): void {
      label('failure');
      console.error('Error handling CloudFormation stack event', message);
      return send(event, context, FAILED);
    }

    const signature: CloudFormationSignature = { event, success, failure };
    return fn(signature);
  };
}

export interface CloudFormationSignature {
  event: any;
  success(payload: any): void;
  failure(message: any): void;
}
