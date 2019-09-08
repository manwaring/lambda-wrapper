import { SNSEvent, Context, Callback } from 'aws-lambda';
import { Metrics } from '../common';
import { successWrapper, errorWrapper } from './responses';
import { SnsParser } from './parser';

const metrics = new Metrics('Sns');

export function sns(
  custom: (props: SnsSignature) => any
): (event: SNSEvent, context: Context, callback: Callback) => any {
  return function handler(event: SNSEvent, context: Context, callback: Callback) {
    const message = new SnsParser(event).getMessage();
    metrics.common(message);
    return custom({
      event,
      message,
      success: successWrapper(metrics, callback),
      error: errorWrapper(metrics, callback)
    });
  };
}

export interface SnsSignature {
  event: SNSEvent; // original event
  message: any; // JSON-parsed message from event
  success(message?: any): void; // invokes lambda callback with success
  error(error?: any): void; // invokes lambda callback with error
}
