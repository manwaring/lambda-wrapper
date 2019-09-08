import { Context, Callback } from 'aws-lambda';
import { Metrics } from '../common';
import { successWrapper, errorWrapper } from './responses';

const metrics = new Metrics('Generic');

export function wrapper(
  custom: (props: WrapperSignature) => any
): (event: any, context: Context, callback: Callback) => any {
  return function handler(event: any, context: Context, callback: Callback) {
    metrics.common(event);
    return custom({ event, success: successWrapper(metrics, callback), error: errorWrapper(metrics, callback) });
  };
}

export interface WrapperSignature {
  event: any; // original event
  success(message?: any): void; // invokes lambda callback with success response
  error(error?: any): void; // invokes lambda callback with error response
}
