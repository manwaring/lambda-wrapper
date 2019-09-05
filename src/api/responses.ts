import { Callback } from 'aws-lambda';
import { Metrics } from '../common';

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true
};

export function successWrapper(metrics: Metrics, callback: Callback) {
  return function success(payload?: any) {
    const response = { statusCode: 200, headers: HEADERS };
    if (payload) {
      response['body'] = JSON.stringify(payload);
    }
    metrics.success(payload);
    callback(null, response);
  };
}

export function invalidWrapper(metrics: Metrics, callback: Callback) {
  return function invalid(errors?: string[]) {
    const response = { statusCode: 400, headers: HEADERS };
    if (errors) {
      response['body'] = JSON.stringify({ errors });
    }
    metrics.invalid(response);
    callback(null, response);
  };
}

export function errorWrapper(metrics: Metrics, callback: Callback) {
  return function error(error?: any) {
    metrics.error(error);
    callback(new Error(error));
  };
}

export function redirectWrapper(metrics: Metrics, callback: Callback) {
  return function redirect(url: string) {
    HEADERS['Location'] = url;
    const response = { statusCode: 302, headers: HEADERS };
    metrics.redirect(response);
    callback(null, response);
  };
}
