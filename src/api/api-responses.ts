import { Metrics } from '../common';

const metrics = new Metrics('API Gateway');

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true
};

export function success(payload: any = null) {
  const response = { statusCode: 200, headers: HEADERS };
  if (payload) {
    response['body'] = JSON.stringify(payload);
  }
  metrics.success(payload);
  return response;
}

export function invalid(errors: string[] = []) {
  const response = { statusCode: 400, headers: HEADERS, body: JSON.stringify({ errors }) };
  metrics.invalid(response);
  return response;
}

export function redirect(url: string) {
  HEADERS['Location'] = url;
  const response = { statusCode: 302, headers: HEADERS };
  metrics.redirect(response);
  return response;
}

export function error(error: any = '') {
  metrics.error(error);
  throw new Error(error);
}
