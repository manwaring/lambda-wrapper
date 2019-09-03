import { cloudFormationWrapper, CloudFormationSignature } from './wrapper';
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

  it('Has expected properties and response funtions', () => {
    function mockHandler({ event, success, failure }: CloudFormationSignature) {
      expect(event).toEqual(requestEvent);
      expect(success).toBeInstanceOf(Function);
      expect(failure).toBeInstanceOf(Function);
    }
    // @ts-ignore
    cloudFormationWrapper(mockHandler)(requestEvent);
  });
});
