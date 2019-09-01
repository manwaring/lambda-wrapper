import { CloudFormationCustomResourceEvent, Context, Callback } from 'aws-lambda';
import { send, SUCCESS, FAILED } from 'cfn-response';
import { Metrics } from './common';

const metrics = new Metrics('CloudFormation');

export function cloudFormationWrapper<T extends Function>(fn: T): T {
  return <any>function(event: CloudFormationCustomResourceEvent, context: Context, callback: Callback) {
    metrics.common(event);

    function success(message?: any): void {
      metrics.success(message);
      return send(event, context, SUCCESS);
    }

    function failure(message: any): void {
      metrics.failure(message);
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
