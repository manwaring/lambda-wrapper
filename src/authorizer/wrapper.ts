import { CustomAuthorizerEvent, Context, Callback } from 'aws-lambda';
import { valid, invalid, error, Policy } from './responses';
import { Metrics } from '../common';

const metrics = new Metrics('Lambda Authorizer');

export function authorizer(
  custom: (props: AuthorizerSignature) => any
): (event: CustomAuthorizerEvent, context: Context, callback: Callback) => any {
  return function handler(event: CustomAuthorizerEvent, context: Context, callback: Callback) {
    metrics.common(event);
    const token = event.authorizationToken;
    return custom({ event, token, valid, invalid, error });
  };
}

export interface AuthorizerSignature {
  event: CustomAuthorizerEvent; // original event
  token: string; // authorizer token from original event
  valid(jwt: any): Policy; // returns AWS policy to authenticate request, and adds auth context if available
  invalid(message?: any): void; // records invalid information and throws 401 unauthorized
  error(error?: any): void; // records error information and throws 401 unauthorized
}
