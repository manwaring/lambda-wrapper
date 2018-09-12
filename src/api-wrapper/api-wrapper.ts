import { APIGatewayEvent, Context, Callback } from 'aws-lambda';
import { label, metric } from '@iopipe/iopipe';
import { tagCommonMetrics } from '../common';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true
};

export function apiWrapper<T extends Function>(fn: T): T {
  return <any>function(event: APIGatewayEvent, context: Context, callback: Callback) {
    tagCommonMetrics();
    const { body, path, query, request, auth } = getRequestFields(event);
    metric('body', body);
    metric('path', path);
    metric('query', query);
    console.debug('Received API request', request);

    function success(payload: any): void {
      label('success');
      console.info('Successfully processed request, returning response payload', payload);
      const body = JSON.stringify(payload);
      return callback(null, { statusCode: 200, headers, body });
    }

    function invalid(errors: string[]): void {
      label('invalid');
      metric('invalid', errors);
      console.warn('Received invalid payload, returning errors payload', errors);
      const body = JSON.stringify({ errors, request });
      return callback(null, { statusCode: 400, headers, body });
    }

    function redirect(url: string): void {
      label('redirect');
      console.info('Returning redirect URL', url);
      headers['Location'] = url;
      return callback(null, { statusCode: 302, headers });
    }

    function error(error: any): void {
      label('error');
      metric('error', error);
      console.error('Error processing request, returning error payload', error);
      return callback(error);
    }

    const signature: ApiSignature = { event, body, path, query, auth, success, invalid, redirect, error };
    return fn(signature);
  };
}

function getRequestFields(event: APIGatewayEvent): any {
  const body = event.body ? JSON.parse(event.body) : null;
  const path = event.pathParameters ? event.pathParameters : null;
  const query = event.queryStringParameters ? event.queryStringParameters : null;
  const auth = event.requestContext && event.requestContext.authorizer ? event.requestContext.authorizer : null;
  const request = { body, path, query, auth };
  return { body, path, query, request, auth };
}

export interface ApiSignature {
  event: APIGatewayEvent; // original event
  body: any; // JSON parsed body payload if exists (otherwise null)
  path: { [name: string]: string }; // path param payload as key-value pairs if exists (otherwise null)
  query: { [name: string]: string }; // query param payload as key-value pairs if exists (otherwise null)
  auth: any; // auth context from custom authorizer if exists (otherwise null)
  success(payload: any): void; // returns 200 status with payload
  invalid(errors: string[]): void; // returns 400 status with errors in payload
  redirect(url: string): void; // returns 302 redirect with new url
  error(error: any): void; // returns 500 status with error and original request payload
}