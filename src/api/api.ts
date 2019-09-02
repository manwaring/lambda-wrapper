import { APIGatewayEvent, Context, Callback } from 'aws-lambda';
import { Metrics, Body } from '../common';

const metrics = new Metrics('API Gateway');

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true
};

export function apiWrapper<T extends Function>(fn: T): T {
  return <any>function(event: APIGatewayEvent, context: Context, callback: Callback) {
    const { body, path, query, request, auth, headers, testRequest } = getRequestFields(event);
    metrics.common(request);

    function success(payload: any = null): void {
      const response = { statusCode: 200, headers: HEADERS };
      if (payload) {
        response['body'] = JSON.stringify(payload);
      }
      metrics.success(payload);
      return callback(null, response);
    }

    function invalid(errors: string[] = []): void {
      const response = { statusCode: 400, headers: HEADERS, body: JSON.stringify({ errors, request }) };
      metrics.invalid(response);
      return callback(null, response);
    }

    function redirect(url: string): void {
      HEADERS['Location'] = url;
      const response = { statusCode: 302, headers: HEADERS };
      metrics.redirect(response);
      return callback(null, response);
    }

    function error(error: any = ''): void {
      metrics.error(error);
      return callback(error);
    }

    const signature: ApiSignature = {
      event,
      body,
      path,
      query,
      headers,
      testRequest,
      auth,
      success,
      invalid,
      redirect,
      error
    };
    return fn(signature);
  };
}

function getRequestFields(event: APIGatewayEvent): any {
  const path = event.pathParameters ? event.pathParameters : null;
  const query = event.queryStringParameters ? event.queryStringParameters : null;
  const auth = event.requestContext && event.requestContext.authorizer ? event.requestContext.authorizer : null;
  const headers = event.headers ? event.headers : null;
  const body = new Body(event.body, headers).getParsedBody();
  const TEST_REQUEST_HEADER = process.env.TEST_REQUEST_HEADER || 'Test-Request';
  const testRequest = headers && headers[TEST_REQUEST_HEADER] ? JSON.parse(headers[TEST_REQUEST_HEADER]) : false;
  const request = { body, path, query, auth, headers, testRequest };
  return { body, path, query, auth, request, headers, testRequest };
}

export interface ApiSignature {
  event: APIGatewayEvent; // original event
  body: any; // JSON parsed body payload if exists (otherwise null)
  path: { [name: string]: string }; // path param payload as key-value pairs if exists (otherwise null)
  query: { [name: string]: string }; // query param payload as key-value pairs if exists (otherwise null)
  headers: { [name: string]: string }; // header payload as key-value pairs if exists (otherwise null)
  testRequest: boolean; // indicates if this is a test request - looks for a header matching process.env.TEST_REQUEST_HEADER (dynamic from application) or 'Test-Request' (default)
  auth: any; // auth context from custom authorizer if exists (otherwise null)
  success(payload?: any): void; // returns 200 status with payload
  invalid(errors?: string[]): void; // returns 400 status with errors in payload
  redirect(url: string): void; // returns 302 redirect with new url
  error(error?: any): void; // returns 500 status with error and original request payload
}
