import { SNSEvent, Context, Callback } from 'aws-lambda';
import { Metrics } from '../common';
import { success, error } from './responses';
import { SnsParser } from './parser';

const metrics = new Metrics('Sns');

export function sns(
  custom: (props: SnsSignature) => any
): (event: SNSEvent, context: Context, callback: Callback) => any {
  return function handler(event: SNSEvent, context: Context, callback: Callback) {
    const message = new SnsParser(event).getMessage();
    metrics.common(message);
    return custom({ event, message, success, error });
  };
}

export interface SnsSignature {
  event: SNSEvent; // original event
  message: any; // JSON-parsed message from event
  success(message?: any): any; // logs and returns the message
  error(error?: any): void; // logs the error and throws
}
