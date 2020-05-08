import { snsEvent } from 'serverless-plugin-test-helper';
import { sns, SnsSignature } from './wrapper';

describe('Stream wrapper', () => {
  const Sns = { Message: 'hello world' };
  const requestEvent = snsEvent({ Records: [{ Sns }] });
  const context = {
    callbackWaitsForEmptyEventLoop: false,
    functionName: 'function-name',
    functionVersion: '$LATEST',
    invokedFunctionArn: 'arn:',
    memoryLimitInMB: '128',
    awsRequestId: 'request',
    logGroupName: 'group',
    logStreamName: 'stream',
    getRemainingTimeInMillis: () => 2,
    done: () => {},
    fail: () => {},
    succeed: () => {},
  };
  const callback = jest.fn((err, result) => (err ? new Error(err) : result));

  it('Has expected properties and response funtions', () => {
    function custom({ event, message, success, error }: SnsSignature) {
      expect(event).toEqual(requestEvent);
      expect(message).toEqual('hello world');
      expect(success).toBeInstanceOf(Function);
      expect(error).toBeInstanceOf(Function);
      success('success');
    }
    sns(custom)(requestEvent, context, callback);
  });

  it('Has expected properties and response funtions with optional type generics', () => {
    interface CustomType {
      Message: string;
      Id: number;
    }
    function custom({ event, message, success, error }: SnsSignature<CustomType>) {
      expect(event).toEqual(requestEvent);
      expect(message).toEqual('hello world');
      expect(success).toBeInstanceOf(Function);
      expect(error).toBeInstanceOf(Function);
      success('success');
    }
    sns<CustomType>(custom)(requestEvent, context, callback);
  });
});
