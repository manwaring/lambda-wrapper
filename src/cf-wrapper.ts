import { CloudFormationCustomResourceEvent, Context, Callback } from 'aws-lambda';
import { send, SUCCESS, FAILED } from 'cfn-response';
import { tagCommonMetrics, tagSuccess, tagFailure } from './common';

export function cloudFormationWrapper<T extends Function>(fn: T): T {
  return <any>function(event: CloudFormationCustomResourceEvent, context: Context, callback: Callback) {
    tagCommonMetrics();

    function success(message?: any): void {
      tagSuccess();
      console.info('Successfully processed CloudFormation stack event', message ? message : '');
      return send(event, context, SUCCESS);
    }

    function failure(message: any): void {
      tagFailure();
      console.error('Error handling CloudFormation stack event', message);
      return send(event, context, FAILED);
    }

    const signature: CloudFormationSignature = { event, success, failure };
    return fn(signature);
  };
}

export interface CloudFormationSignature {
  event: CloudFormationCustomResourceEvent; // original event
  success(message?: any): void; // sends CloudFormation success event
  failure(message: any): void; // sends CloudFormation failure event
}
