import { Context, Callback } from 'aws-lambda';
import { HttpApiEvent } from './payload';
import { Request } from './parser';
import {
  success,
  invalid,
  notFound,
  notAuthorized,
  error,
  redirect,
  ApiResponse,
  ResponseParameters,
  RedirectParameters,
  ErrorParameters,
} from './responses';

export function httpApi<T = any>(
  custom: (props: HttpApiSignature) => any
): (event: HttpApiEvent, context: Context, callback: Callback) => any {
  return function handler(event: HttpApiEvent) {
    const { body, path, query, auth, headers, testRequest } = new Request(event).getProperties();
    const signature: HttpApiSignature<T> = {
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

export interface HttpApiSignature<T = any> {
  event: HttpApiEvent; // original event provided by AWS (https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html)
  body: T; // body parsed according to content-type headers (or in original format if no content-type headers found)
  path: { [name: string]: string }; // path params as key-value pairs
  query: { [name: string]: string }; // query params as key-value pairs
  headers: { [name: string]: string }; // headers as key-value pairs
  testRequest: boolean; // indicates if this is a test request - looks for a header matching process.env.TEST_REQUEST_HEADER (dynamic from application) or 'Test-Request' (default)
  auth: any; // auth context from JWT authorizer
  success(params: ResponseParameters): ApiResponse;
  invalid(params: ResponseParameters): ApiResponse;
  notFound(params: ResponseParameters): ApiResponse;
  notAuthorized(params: ResponseParameters): ApiResponse;
  redirect(params: RedirectParameters): ApiResponse;
  error(params: ErrorParameters): ApiResponse;
}
