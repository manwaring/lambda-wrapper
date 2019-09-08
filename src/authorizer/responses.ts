import { Callback } from 'aws-lambda';
import { Metrics } from '../common';

export function validWrapper(metrics: Metrics, callback: Callback) {
  return function valid(jwt: any) {
    const policy = generatePolicy(jwt);
    metrics.valid(policy);
    callback(null, policy);
  };
}

export function invalidWrapper(metrics: Metrics, callback: Callback) {
  return function invalid(message?: any): void {
    metrics.invalid(message);
    callback('Unauthorized');
  };
}

export function errorWrapper(metrics: Metrics, callback: Callback) {
  return function error(error?: any) {
    metrics.error(error);
    callback(error);
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
