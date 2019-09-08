import { cloudFormation, CloudFormationSignature } from './wrapper';
import { CloudFormationCustomResourceEvent } from 'aws-lambda';

describe('Stream wrapper', () => {
  const requestEvent: CloudFormationCustomResourceEvent = {
    RequestType: 'Create',
    ServiceToken: 'token',
    ResponseURL: 'url',
    StackId: 'stackId',
    RequestId: 'requestId',
    LogicalResourceId: 'resourceId',
    ResourceType: 'resourceType',
    ResourceProperties: {
      ServiceToken: 'serviceToken'
    }
  };
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
    function custom({ event, success, failure }: CloudFormationSignature) {
      expect(event).toEqual(requestEvent);
      expect(success).toBeInstanceOf(Function);
      expect(failure).toBeInstanceOf(Function);
    }

    cloudFormation(custom)(requestEvent, context, callback);
  });
});
