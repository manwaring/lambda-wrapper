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
} from '../shared';

export function httpApi<T = any>(
  custom: (props: HttpApiSignature<T>) => any
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
  event: HttpApiEvent;
  body: T;
  path: { [name: string]: string };
  query: { [name: string]: string };
  headers: { [name: string]: string };
  testRequest: boolean;
  auth: any;
  success(params?: ResponseParameters): ApiResponse;
  invalid(params?: ResponseParameters): ApiResponse;
  notFound(params?: ResponseParameters): ApiResponse;
  notAuthorized(params?: ResponseParameters): ApiResponse;
  redirect(params: RedirectParameters): ApiResponse;
  error(params?: ErrorParameters): ApiResponse;
}
