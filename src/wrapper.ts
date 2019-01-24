import { Context, Callback } from 'aws-lambda';
import { label } from 'epsagon';
import { tagCommonMetrics } from './common';

export function wrapper<T extends Function>(fn: T): T {
  return <any>function(event, context: Context, callback: Callback) {
    tagCommonMetrics();
    console.debug('Received event', event);

    function success(message?: any): void {
      label('success');
      console.info('Successfully processed request', message ? message : '');
      return callback(null, message);
    }

    function error(error: any): void {
      label('error');
      console.error('Error processing request', error);
      return callback(error);
    }

    const signature: WrapperSignature = { event, success, error };
    return fn(signature);
  };
}

export interface WrapperSignature {
  event: any; // original event
  success(message?: any): void; // invokes lambda callback with success response
  error(error: any): void; // invokes lambda callback with error response
}
