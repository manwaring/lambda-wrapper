import { Callback } from 'aws-lambda';
import { Metrics } from '../common';

export function successWrapper(metrics: Metrics, callback: Callback) {
  return function success(message: any): void {
    metrics.success(message);
    callback(null, message);
  };
}

export function errorWrapper(metrics: Metrics, callback: Callback) {
  return function error(error: any): void {
    metrics.error(error);
    callback(error);
  };
}
