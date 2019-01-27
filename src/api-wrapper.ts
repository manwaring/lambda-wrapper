import { parse } from 'querystring';
import { APIGatewayEvent, Context, Callback } from 'aws-lambda';
import { label } from 'epsagon';
import { tagCommonMetrics } from './common';

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true
};

export function apiWrapper<T extends Function>(fn: T): T {
  return <any>function(event: APIGatewayEvent, context: Context, callback: Callback) {
    tagCommonMetrics();
    const { body, path, query, request, auth, headers, testRequest } = getRequestFields(event);
    console.debug('Received API request', request);

    function success(payload: any = {}): void {
      label('success');
      console.info('Successfully processed request, returning response payload', payload);
      const body = JSON.stringify(payload);
      return callback(null, { statusCode: 200, headers: HEADERS, body });
    }

    function invalid(errors: string[] = []): void {
      label('invalid');
      console.warn('Received invalid payload, returning errors payload', errors);
      const body = JSON.stringify({ errors, request });
      return callback(null, { statusCode: 400, headers: HEADERS, body });
    }

    function redirect(url: string): void {
      label('redirect');
      console.info('Returning redirect URL', url);
      HEADERS['Location'] = url;
      return callback(null, { statusCode: 302, headers: HEADERS });
    }

    function error(error: any = ''): void {
      label('error');
      console.error('Error processing request, returning error payload', error);
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
  const body = parseBody(event.body, headers);
  const TEST_REQUEST_HEADER = process.env.TEST_REQUEST_HEADER || 'Test-Request';
  const testRequest = headers && headers[TEST_REQUEST_HEADER] ? JSON.parse(headers[TEST_REQUEST_HEADER]) : false;
  const request = { body, path, query, auth, headers, testRequest };
  return { body, path, query, auth, request, headers, testRequest };
}

function parseBody(body: any, headers: { [name: string]: string }): any {
  let parsedBody = null;
  if (body) {
    try {
      const contentType = headers['Content-Type'] || headers['CONTENT-TYPE'] || headers['content-type'];
      if (contentType && contentType.toUpperCase() === 'APPLICATION/X-WWW-FORM-URLENCODED') {
        parsedBody = parse(body);
      } else if (contentType && contentType.toUpperCase() === 'APPLICATION/JSON') {
        parsedBody = JSON.parse(body);
      } else {
        console.error('Content-Type header not found, unable to parse body');
        parsedBody = body;
      }
    } catch (err) {
      console.error('Error parsing body', err, body);
      parsedBody = body;
    }
  }
  return parsedBody;
}

export interface ApiSignature {
  event: APIGatewayEvent; // original event
  body: any; // JSON parsed body payload if exists (otherwise null)
  path: { [name: string]: string }; // path param payload as key-value pairs if exists (otherwise null)
  query: { [name: string]: string }; // query param payload as key-value pairs if exists (otherwise null)
  headers: { [name: string]: string }; // header payload as key-value pairs if exists (otherwise null)
  testRequest: boolean; // indicates if this is a test request - looks for a header matching process.env.TEST_REQUEST_HEADER (dynamic from application) or 'Test-Request' (default)
  auth: any; // auth context from custom authorizer if exists (otherwise null)
  success(payload: any): void; // returns 200 status with payload
  invalid(errors: string[]): void; // returns 400 status with errors in payload
  redirect(url: string): void; // returns 302 redirect with new url
  error(error: any): void; // returns 500 status with error and original request payload
}
