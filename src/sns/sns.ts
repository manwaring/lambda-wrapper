import { SNSEvent } from 'aws-lambda';
import { Metrics } from '../common';

const metrics = new Metrics('SNS');

export function snsWrapper<T extends Function>(fn: T): T {
  return <any>function(event: SNSEvent) {
    const message = JSON.parse(event.Records[0].Sns.Message);
    metrics.common(message);

    function success(message: any = ''): void {
      metrics.success(message);
      return message;
    }

    function error(error: any = ''): void {
      metrics.error(error);
      throw new Error(error);
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
