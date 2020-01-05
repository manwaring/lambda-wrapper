import { valid, invalid, error } from './responses';

describe('Lambda Authorizer responses', () => {
  it('Handles valid response with jwt sub', () => {
    const jwt = {
      sub: '1234567890',
      name: 'John Doe',
      admin: true
    };

    const response = valid(jwt);
    expect(response).toEqual({
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
    const jwt = {
      claims: 'abcdefghij',
      name: 'John Doe',
      admin: true
    };

    const response = valid(jwt);
    expect(response).toEqual({
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
    const jwt = {
      name: 'John Doe',
      admin: true
    };

    const response = valid(jwt);
    expect(response).toEqual({
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
    expect(() => invalid()).toThrow();
    // const response = invalid();
    // expect(callback).toHaveBeenCalledWith('Unauthorized');
  });

  it('Handles error response', () => {
    expect(() => error('error')).toThrow();
    // const response = error('error');
    // expect(callback).toHaveBeenCalledWith('error');
  });
});
