import { CustomAuthorizerEvent, Context, Callback } from 'aws-lambda';
import { Metrics } from '../common';
import { validWrapper, invalidWrapper, errorWrapper } from './responses';

const metrics = new Metrics('Lambda Authorizer');

export function authorizer(
  custom: (props: AuthorizerSignature) => any
): (event: CustomAuthorizerEvent, context: Context, callback: Callback) => any {
  return function handler(event: CustomAuthorizerEvent, context: Context, callback: Callback) {
    metrics.common(event);
    const token = event.authorizationToken;

    return custom({
      event,
      token,
      valid: validWrapper(metrics, callback),
      invalid: invalidWrapper(metrics, callback),
      error: errorWrapper(metrics, callback)
    });
  };
}

export interface AuthorizerSignature {
  event: CustomAuthorizerEvent; // original event
  token: string; // authorizer token from original event
  valid(jwt: any): void; // creates AWS policy to authenticate request, and adds auth context if available
  invalid(message?: any): void; // returns 401 unauthorized
  error(error?: any): void; // records error information and returns 401 unauthorized
}
