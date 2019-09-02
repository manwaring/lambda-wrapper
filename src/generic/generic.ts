import { Context, Callback } from 'aws-lambda';
import { Metrics } from '../common';

const metrics = new Metrics('Generic');

export function wrapper<T extends Function>(fn: T): T {
  return <any>function(event, context: Context, callback: Callback) {
    metrics.common(event);

    function success(message: any = ''): void {
      metrics.success(message);
      return callback(null, message);
    }

    function error(error: any = ''): void {
      metrics.error(error);
      return callback(error);
    }

    const signature: WrapperSignature = { event, success, error };
    return fn(signature);
  };
}

export interface WrapperSignature {
  event: any; // original event
  success(message?: any): void; // invokes lambda callback with success response
  error(error?: any): void; // invokes lambda callback with error response
}