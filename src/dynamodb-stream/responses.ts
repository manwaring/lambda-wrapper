import { Callback } from 'aws-lambda';
import { Metrics } from '../common';

const metrics = new Metrics('DynamoDB Stream');

export function success(message: any): void {
  metrics.success(message);
  return message;
}

export function error(error: any): void {
  metrics.error(error);
  if (error instanceof Error) {
    throw error;
  } else {
    throw new Error(error);
  }
}
