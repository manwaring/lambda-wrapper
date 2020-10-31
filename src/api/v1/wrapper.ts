import { APIGatewayEvent, Context, Callback, APIGatewayEventIdentity } from 'aws-lambda';
import { Request } from './parser';
import {
  success,
  invalid,
  notFound,
  notAuthorized,
  error,
  redirect,
  custom,
  ApiResponse,
  ResponseParameters,
  RedirectParameters,
  ErrorParameters,
  CustomParameters,
} from '../shared';

export function api<T = any>(
  customHandler: (props: ApiSignature<T>) => any
): (event: APIGatewayEvent, context: Context, callback: Callback) => any {
  return function handler(event: APIGatewayEvent) {
    const { body, websocket, path, query, auth, headers, testRequest } = new Request(event).getProperties();
    const signature: ApiSignature<T> = {
      event,
      body,
      websocket,
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
      custom,
    };
    return customHandler(signature);
  };
}

export interface ApiSignature<T = any> {
  event: APIGatewayEvent;
  body: T;
  websocket: WebsocketRequest;
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
  custom(params: CustomParameters): ApiResponse;
}

export interface WebsocketRequest {
  accountId: string;
  apiId: string;
  connectedAt?: number;
  connectionId?: string;
  domainName?: string;
  domainPrefix?: string;
  eventType?: string;
  extendedRequestId?: string;
  protocol: string;
  httpMethod: string;
  identity: APIGatewayEventIdentity;
  messageDirection?: string;
  messageId?: string | null;
  path: string;
  stage: string;
  requestId: string;
  requestTime?: string;
  requestTimeEpoch: number;
  resourceId: string;
  resourcePath: string;
  routeKey?: string;
}
