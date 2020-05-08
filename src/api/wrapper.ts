import { APIGatewayEvent, Context, Callback } from 'aws-lambda';
import { Request } from './parser';
import { success, invalid, notFound, notAuthorized, error, redirect, ApiResponse } from './responses';

export function api<T = any>(
  custom: (props: ApiSignature<T>) => any
): (event: APIGatewayEvent, context: Context, callback: Callback) => any {
  return function handler(event: APIGatewayEvent) {
    const { body, path, query, auth, headers, testRequest } = new Request(event).getProperties();
    const signature: ApiSignature<T> = {
      event,
      body,
      path,
      query,
      headers,
      testRequest,
      auth,
      success,
      invalid,
      notFound,
      notAuthorized,
      error,
      redirect,
    };
    return custom(signature);
  };
}

export interface ApiSignature<T = any> {
  event: APIGatewayEvent; // original event
  body: T; // JSON parsed body payload if exists (otherwise undefined)
  path: { [name: string]: string }; // path param payload as key-value pairs if exists (otherwise undefined)
  query: { [name: string]: string }; // query param payload as key-value pairs if exists (otherwise undefined)
  headers: { [name: string]: string }; // header payload as key-value pairs if exists (otherwise undefined)
  testRequest: boolean; // indicates if this is a test request - looks for a header matching process.env.TEST_REQUEST_HEADER (dynamic from application) or 'Test-Request' (default)
  auth: any; // auth context from custom authorizer if exists (otherwise undefined)
  success(payload?: any, replacer?: (this: any, key: string, value: any) => any): ApiResponse; // returns 200 status code with optional payload as body
  invalid(errors?: string[]): ApiResponse; // returns 400 status code with optional errors as body
  notFound(message?: string): ApiResponse; // returns 404 status code with optional message as body
  notAuthorized(message?: string): ApiResponse; // returns 403 status code with optional message as body
  redirect(url: string): ApiResponse; // returns 302 status code (redirect) with new url
  error(error?: any): ApiResponse; // returns 500 status code with optional error as body
}
