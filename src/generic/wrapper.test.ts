import { wrapper, WrapperSignature } from './wrapper';

describe('Stream wrapper', () => {
  const requestEvent = { hello: 'world' };
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

  it('Has expected properties and response funtions', () => {
    function custom({ event, success, error }: WrapperSignature) {
      expect(event).toEqual(requestEvent);
      expect(success).toBeInstanceOf(Function);
      expect(error).toBeInstanceOf(Function);
      success('success');
    }

    wrapper(custom)(requestEvent, context, callback);
  });
});
