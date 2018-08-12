import { CustomAuthorizerEvent } from 'aws-lambda';
import { label, metric } from '@iopipe/iopipe';
import { tagCommonMetrics } from './common';

export function authWrapper<T extends Function>(fn: T): T {
  return <any>function(event: CustomAuthorizerEvent, context: any, callback: any) {
    tagCommonMetrics();
    const token = event.authorizationToken;
    console.debug('Received API authorizer request', event);

    function valid(jwt: any): void {
      console.info('Successfully processed authorizer request');
      label('valid');
      const policy = generatePolicy(jwt);
      return callback(null, policy);
    }

    function invalid(message: any): void {
      console.warn('Authorizer token was invalid', message);
      label('invalid');
      metric('invalid', message);
      return callback('Unauthorized');
    }

    function error(error: any): void {
      console.error('Error authorizing API call', error, event);
      label('error');
      metric('error', error);
      return callback(error);
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
  event: CustomAuthorizerEvent;
  token: string;
  valid(jwt: any): void;
  invalid(message: string[]): void;
  error(error: any): void;
}
