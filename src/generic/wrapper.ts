import { Metrics } from '../common';
import { success, error } from './responses';

const metrics = new Metrics('Generic');

export function wrapper<T extends Function>(fn: T): T {
  return <any>function(event) {
    metrics.common(event);
    const signature: WrapperSignature = { event, success, error };
    return fn(signature);
  };
}

export interface WrapperSignature {
  event: any; // original event
  success(message?: any): void; // invokes lambda callback with success response
  error(error?: any): void; // invokes lambda callback with error response
}
