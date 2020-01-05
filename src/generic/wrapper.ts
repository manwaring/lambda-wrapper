import { Context, Callback } from 'aws-lambda';
import { Metrics } from '../common';
import { success, error } from './responses';

const metrics = new Metrics('Generic');

export function wrapper(
  custom: (props: WrapperSignature) => any
): (event: any, context: Context, callback: Callback) => any {
  return function handler(event: any, context: Context, callback: Callback) {
    metrics.common(event);
    return custom({ event, success, error });
  };
}

export interface WrapperSignature {
  event: any; // original event
  success(message?: any): any; // logs and returns the message
  error(error?: any): void; // logs the error and throws
}
