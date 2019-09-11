import { Context, CloudFormationCustomResourceEvent } from 'aws-lambda';
import { send, SUCCESS, FAILED } from 'cfn-response';
import { Metrics } from '../common';

const metrics = new Metrics('Cloudformation');

export function successWrapper(event: CloudFormationCustomResourceEvent, context: Context) {
  return function success(message?: any): void {
    metrics.success(message);
    send(event, context, SUCCESS);
  };
}
export function failureWrapper(event: CloudFormationCustomResourceEvent, context: Context) {
  return function failure(message: any): void {
    metrics.failure(message);
    send(event, context, FAILED);
  };
}
