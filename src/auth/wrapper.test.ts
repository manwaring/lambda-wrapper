import { authWrapper, AuthorizerSignature } from './wrapper';

describe('Stream wrapper', () => {
  const requestEvent = {
    type: 'type',
    methodArn: 'methodArn',
    authorizationToken: 'token'
  };

  it('Has expected properties and response funtions', () => {
    function mockHandler({ event, token, valid, invalid, error }: AuthorizerSignature) {
      expect(event).toEqual(requestEvent);
      expect(token).toEqual('token');
      expect(valid).toBeInstanceOf(Function);
      expect(invalid).toBeInstanceOf(Function);
      expect(error).toBeInstanceOf(Function);
    }
    // @ts-ignore
    authWrapper(mockHandler)(requestEvent);
  });
});
