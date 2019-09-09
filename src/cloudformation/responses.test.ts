import { Context, CloudFormationCustomResourceEvent } from 'aws-lambda';
import { send } from 'cfn-custom-response';
import { successWrapper, failureWrapper } from './responses';

jest.mock('cfn-custom-response');

describe('Cloudformation responses', () => {
  const event: CloudFormationCustomResourceEvent = {
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
  const context: Context = {
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

  it('Handles successWrapper response', () => {
    const success = successWrapper(event, context);
    expect(success).toBeInstanceOf(Function);
    success('success');
    expect(send).toBeCalled();
  });

  it('Handles failureWrapper response', () => {
    const failure = failureWrapper(event, context);
    expect(failure).toBeInstanceOf(Function);
    failure('failure');
    expect(send).toBeCalled();
  });
});
