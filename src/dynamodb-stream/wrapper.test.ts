import createEvent from '@serverless/event-mocks';
import { dynamodbStream, DynamoDBStreamSignature } from './wrapper';

describe('DynamoDB Stream wrapper', () => {
  // @ts-ignore
  const requestEvent = createEvent('aws:dynamo', {});
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
    succeed: () => {}
  };
  const callback = jest.fn((err, result) => (err ? new Error(err) : result));

  it('Has expected properties and response function', () => {
    function custom({ event, newVersions, oldVersions, versions, success, error }: DynamoDBStreamSignature) {
      expect(event).toEqual(requestEvent);
      expect(newVersions).toEqual([{ Message: 'New item!', Id: 101 }]);
      expect(oldVersions).toEqual([]);
      expect(versions).toEqual([
        {
          newVersion: { Message: 'New item!', Id: 101 },
          oldVersion: undefined,
          keys: { Id: 101 },
          tableName: 'images',
          tableArn: 'arn:aws:dynamodb:us-east-1:123456789012:table/images',
          eventName: 'INSERT'
        }
      ]);
      expect(success).toBeInstanceOf(Function);
      expect(error).toBeInstanceOf(Function);
      success('success');
    }
    dynamodbStream(custom)(requestEvent, context, callback);
  });
});
