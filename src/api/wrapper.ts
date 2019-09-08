import { APIGatewayEvent, Context, Callback } from 'aws-lambda';
import { Request } from './parser';
import { Metrics } from '../common';
import { successWrapper, invalidWrapper, errorWrapper, redirectWrapper } from './responses';

const metrics = new Metrics('API Gateway');

export function api(
  custom: (props: ApiSignature) => any
): (event: APIGatewayEvent, context: Context, callback: Callback) => any {
  return function handler(event: APIGatewayEvent, context: Context, callback: Callback) {
    const { body, path, query, auth, headers, testRequest } = new Request(event).getProperties();

    return custom({
      event,
      body,
      path,
      query,
      headers,
      testRequest,
      auth,
      success: successWrapper(metrics, callback),
      invalid: invalidWrapper(metrics, callback),
      error: errorWrapper(metrics, callback),
      redirect: redirectWrapper(metrics, callback)
    });
  };
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
