import { authorizer, AuthorizerSignature } from './wrapper';

const context = {
  callbackWaitsForEmptyEventLoop: false,
  functionName: 'function-name',
  functionVersion: '$LATEST',
  invokedFunctionArn: 'arn:',
  memoryLimitInMB: 128,
  awsRequestId: 'request',
  logGroupName: 'group',
  logStreamName: 'stream',
  getRemainingTimeInMillis: () => 2,
  done: () => {},
  fail: () => {},
  succeed: () => {}
};
const callback = jest.fn((err, result) => (err ? new Error(err) : result));

describe('Stream wrapper', () => {
  const requestEvent = {
    type: 'type',
    methodArn: 'methodArn',
    authorizationToken: 'token'
  };

  it('Has expected properties and response funtions', () => {
    function custom({ event, token, valid, invalid, error }: AuthorizerSignature) {
      expect(event).toEqual(requestEvent);
      expect(token).toEqual('token');
      expect(valid).toBeInstanceOf(Function);
      expect(invalid).toBeInstanceOf(Function);
      expect(error).toBeInstanceOf(Function);
      error('error');
    }
    authorizer(custom)(requestEvent, context, callback);
  });
});
