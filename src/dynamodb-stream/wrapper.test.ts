import { dynamoDBStreamEvent, context } from 'serverless-plugin-test-helper';
import { dynamodbStream, DynamoDBStreamSignature } from './wrapper';

describe('DynamoDB Stream wrapper', () => {
  const requestEvent = dynamoDBStreamEvent();
  const callback = jest.fn((err, result) => (err ? new Error(err) : result));

  it('Has expected properties and response function without optional types', () => {
    function custom({ event, newVersions, oldVersions, versions, success, error }: DynamoDBStreamSignature) {
      expect(event).toEqual(requestEvent);
      expect(newVersions).toEqual([{ Message: 'This item has changed', Id: 101 }]);
      expect(oldVersions).toEqual([{ Id: 101, Message: 'New item!' }]);
      expect(versions).toEqual([
        {
          newVersion: { Message: 'This item has changed', Id: 101 },
          oldVersion: { Message: 'New item!', Id: 101 },
          keys: { Id: 101 },
          tableArn: 'arn:aws:dynamodb:us-east-1:123456789012:table/images',
          tableName: 'images',
          eventName: 'MODIFY',
        },
      ]);
      expect(success).toBeInstanceOf(Function);
      expect(error).toBeInstanceOf(Function);
      success('success');
    }
    dynamodbStream(custom)(requestEvent, context, callback);
  });

  it('Has expected properties and response function with optional types', () => {
    interface CustomType {
      Message: string;
      Id: number;
    }
    function custom({
      event,
      newVersions,
      oldVersions,
      versions,
      success,
      error,
    }: DynamoDBStreamSignature<CustomType>) {
      expect(event).toEqual(requestEvent);
      expect(newVersions).toEqual([{ Message: 'This item has changed', Id: 101 }]);
      expect(oldVersions).toEqual([{ Id: 101, Message: 'New item!' }]);
      expect(versions).toEqual([
        {
          newVersion: { Message: 'This item has changed', Id: 101 },
          oldVersion: { Message: 'New item!', Id: 101 },
          keys: { Id: 101 },
          tableArn: 'arn:aws:dynamodb:us-east-1:123456789012:table/images',
          tableName: 'images',
          eventName: 'MODIFY',
        },
      ]);
      expect(success).toBeInstanceOf(Function);
      expect(error).toBeInstanceOf(Function);
      success('success');
    }
    dynamodbStream<CustomType>(custom)(requestEvent, context, callback);
  });
});
