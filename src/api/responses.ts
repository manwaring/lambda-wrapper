import { Callback } from 'aws-lambda';
import { Metrics } from '../common';

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true
};

export class Responses {
  constructor(private metrics: Metrics, private callback: Callback) {}

  success(payload?: any) {
    const response = { statusCode: 200, headers: HEADERS };
    if (payload) {
      response['body'] = JSON.stringify(payload);
    }
    this.metrics.success(payload);
    this.callback(null, response);
  }

  invalid(errors?: string[]) {
    const response = { statusCode: 400, headers: HEADERS };
    if (errors) {
      response['body'] = JSON.stringify({ errors });
    }
    this.metrics.invalid(response);
    this.callback(null, response);
  }

  redirect(url: string) {
    HEADERS['Location'] = url;
    const response = { statusCode: 302, headers: HEADERS };
    this.metrics.redirect(response);
    this.callback(null, response);
  }

  error(error?: any) {
    this.metrics.error(error);
    this.callback(new Error(error));
  }
}
