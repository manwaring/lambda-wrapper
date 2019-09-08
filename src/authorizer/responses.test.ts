import { validWrapper, invalidWrapper, errorWrapper } from './responses';
import { Metrics } from '../common';

describe('Lambda Authorizer responses', () => {
  const metrics = new Metrics('Lambda Authorizer');
  const callback = jest.fn((err, result) => (err ? new Error(err) : result));

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('Handles valid response with jwt sub', () => {
    const valid = validWrapper(metrics, callback);
    const jwt = {
      sub: '1234567890',
      name: 'John Doe',
      admin: true
    };

    valid(jwt);
    expect(callback).toHaveBeenCalledWith(null, {
      principalId: '1234567890',
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
    });
  });

  it('Handles valid response with jwt claims', () => {
    const valid = validWrapper(metrics, callback);
    const jwt = {
      claims: 'abcdefghij',
      name: 'John Doe',
      admin: true
    };

    valid(jwt);
    expect(callback).toHaveBeenCalledWith(null, {
      principalId: 'abcdefghij',
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
    });
  });

  it('Handles valid response without jwt subs or claims', () => {
    const valid = validWrapper(metrics, callback);
    const jwt = {
      name: 'John Doe',
      admin: true
    };

    valid(jwt);
    expect(callback).toHaveBeenCalledWith(null, {
      principalId: '',
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
    });
  });

  it('Handles invalid response', () => {
    const invalid = invalidWrapper(metrics, callback);
    invalid();
    expect(callback).toHaveBeenCalledWith('Unauthorized');
  });

  it('Handles error response', () => {
    const error = errorWrapper(metrics, callback);
    error('error');
    expect(callback).toHaveBeenCalledWith('error');
  });
});
