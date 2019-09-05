import { CustomAuthorizerEvent } from 'aws-lambda';
import { Metrics } from '../common';
import { valid, invalid, error } from './responses';

const metrics = new Metrics('Lambda Authorizer');

export function authorizer<T extends Function>(fn: T): T {
  return <any>function(event: CustomAuthorizerEvent) {
    metrics.common(event);
    const token = event.authorizationToken;

    const signature: AuthorizerSignature = { event, token, valid, invalid, error };
    return fn(signature);
  };
}

export interface AuthorizerSignature {
  event: CustomAuthorizerEvent; // original event
  token: string; // authorizer token from original event
  valid(jwt: any): void; // creates AWS policy to authenticate request, and adds auth context if available
  invalid(message?: any): void; // returns 401 unauthorized
  error(error?: any): void; // records error information and returns 401 unauthorized
}
