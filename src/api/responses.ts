import { Metrics, logger } from '../common';

const DEFAULT_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true
};

const metrics = new Metrics('API Gateway');

export function success(payload?: any, replacer?: (this: any, key: string, value: any) => any): ApiResponse {
  const response = { statusCode: 200, headers: { ...DEFAULT_HEADERS } };
  if (payload) {
    response['body'] = replacer ? JSON.stringify(payload, replacer) : JSON.stringify(payload);
    response.headers['Content-Type'] = 'application/json';
  }
  metrics.success(response);
  return response;
}

export function invalid(errors?: any[]): ApiResponse {
  const response = { statusCode: 400, headers: { ...DEFAULT_HEADERS } };
  if (errors) {
    response['body'] = JSON.stringify({ errors });
    response.headers['Content-Type'] = 'application/json';
  }
  metrics.invalid(response);
  return response;
}

export function notFound(message?: string): ApiResponse {
  const response = { statusCode: 404, headers: { ...DEFAULT_HEADERS } };
  if (message) {
    response['body'] = JSON.stringify({ message });
    response.headers['Content-Type'] = 'application/json';
  }
  metrics.invalid(message);
  return response;
}

export function notAuthorized(message?: string): ApiResponse {
  const response = { statusCode: 403, headers: { ...DEFAULT_HEADERS } };
  if (message) {
    response['body'] = JSON.stringify({ message });
    response.headers['Content-Type'] = 'application/json';
  }
  metrics.invalid(message);
  return response;
}

export function error(message?: any): ApiResponse {
  const response = { statusCode: 500, headers: { ...DEFAULT_HEADERS } };
  if (message && message instanceof Error) {
    logger.debug('Encountered error while processing request', message);
    message = message.message;
  }
  if (message) {
    response['body'] = JSON.stringify({ message });
    response.headers['Content-Type'] = 'application/json';
  }
  metrics.error(response);
  return response;
}

export function redirect(url: string): ApiResponse {
  const REDIRECT = { Location: url };
  const REDIRECT_HEADERS = { ...DEFAULT_HEADERS, ...REDIRECT };
  const response = { statusCode: 302, headers: REDIRECT_HEADERS };
  metrics.redirect(response);
  return response;
}

export interface ApiResponse {
  statusCode: number;
  headers: { [name: string]: string | boolean };
  body?: string;
}
