import { CustomAuthorizerEvent } from 'aws-lambda';
import { Metrics } from '../common';

const metrics = new Metrics('API Gateway Auth');

export function authWrapper<T extends Function>(fn: T): T {
  return <any>function(event: CustomAuthorizerEvent, context: any, callback: any) {
    metrics.common(event);
    const token = event.authorizationToken;

    function valid(jwt: any): void {
      const policy = generatePolicy(jwt);
      metrics.valid(policy);
      return policy;
    }

    function invalid(message: any = ''): void {
      metrics.invalid(message);
      throw new Error('Unauthorized');
    }

    function error(error: any = ''): void {
      metrics.error(error);
      throw new Error(error);
    }

    const signature: AuthorizerSignature = { event, token, valid, invalid, error };
    return fn(signature);
  };
}

function generatePolicy(jwt: any): any {
  const principalId = jwt.sub ? jwt.sub : jwt.claims ? jwt.claims : '';
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: 'arn:aws:execute-api:**'
        }
      ]
    }
  };
}

export interface AuthorizerSignature {
  event: CustomAuthorizerEvent; // original event
  token: string; // authorizer token from original event
  valid(jwt: any): void; // creates AWS policy to authenticate request, and adds auth context if available
  invalid(message?: string[]): void; // returns 401 unauthorized
  error(error?: any): void; // records error information and returns 401 unauthorized
}
