import { Metrics } from '../common';

const metrics = new Metrics('Lambda Authorizer');

export function valid(jwt: any) {
  const policy = generatePolicy(jwt);
  metrics.valid(policy);
  return policy;
}

export function invalid(message?: any): void {
  metrics.invalid(message);
  throw new Error('Unauthorized');
}

export function error(error?: any) {
  metrics.error(error);
  throw new Error(error);
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
