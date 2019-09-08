import { CloudFormationCustomResourceEvent, Context, Callback } from 'aws-lambda';
import { Metrics } from '../common';
import { successWrapper, failureWrapper } from './responses';

const metrics = new Metrics('CloudFormation');

export function cloudFormation(
  custom: (props: CloudFormationSignature) => any
): (event: CloudFormationCustomResourceEvent, context: Context, callback: Callback) => any {
  return function handler(event: CloudFormationCustomResourceEvent, context: Context, callback: Callback) {
    metrics.common(event);

    return custom({
      event,
      success: successWrapper(event, context),
      failure: failureWrapper(event, context)
    });
  };
}

export interface CloudFormationSignature {
  event: CloudFormationCustomResourceEvent; // original event
  success(message?: any): void; // sends CloudFormation success event
  failure(message: any): void; // sends CloudFormation failure event
}
