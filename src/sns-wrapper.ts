import { SNSEvent, Context, Callback } from 'aws-lambda';
import { tagCommonMetrics, tagSuccess, tagError } from './common';

export function snsWrapper<T extends Function>(fn: T): T {
  return <any>function(event: SNSEvent, context: Context, callback: Callback) {
    tagCommonMetrics();
    const message = JSON.parse(event.Records[0].Sns.Message);
    console.debug('Received SNS event', message);

    function success(message: any = ''): void {
      tagSuccess(message);
      console.info('Successfully processed request', message ? message : '');
      return callback(null, message);
    }

    function error(error: any = ''): void {
      tagError(error);
      console.error('Error processing request', error);
      return callback(error);
    }

    const signature: SnsSignature = { event, message, success, error };
    return fn(signature);
  };
}

export interface SnsSignature {
  event: SNSEvent; // original event
  message: any; // JSON-parsed message from event
  success(message?: any): void; // invokes lambda callback with success
  error(error?: any): void; // invokes lambda callback with error
}
