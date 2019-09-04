import { SNSEvent } from 'aws-lambda';
import { Metrics } from '../common';
import { success, error } from './responses';
import { SnsParser } from './parser';

const metrics = new Metrics('Sns');

export function sns<T extends Function>(fn: T): T {
  return <any>function(event: SNSEvent) {
    const message = new SnsParser(event).getMessage();
    metrics.common(message);

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
