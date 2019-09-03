import { CloudFormationCustomResourceEvent, Context } from 'aws-lambda';
import { Metrics } from '../common';
import { successWrapper, failureWrapper } from './responses';

const metrics = new Metrics('CloudFormation');

export function cloudFormationWrapper<T extends Function>(fn: T): T {
  return <any>function(event: CloudFormationCustomResourceEvent, context: Context) {
    metrics.common(event);

    const signature: CloudFormationSignature = {
      event,
      // We need to call these response wrappers so that we can pass in context (necessary for CloudFormation responses) so that
      success: successWrapper(event, context),
      failure: failureWrapper(event, context)
    };
    return fn(signature);
  };
}

export interface CloudFormationSignature {
  event: CloudFormationCustomResourceEvent; // original event
  success(message?: any): void; // sends CloudFormation success event
  failure(message: any): void; // sends CloudFormation failure event
}
