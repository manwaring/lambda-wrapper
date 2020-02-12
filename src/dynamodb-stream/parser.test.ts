import { dynamoDBStreamEvent } from 'serverless-plugin-test-helper';
import { DynamoDBStreamParser } from './parser';

describe('DynamoDB stream parsing', () => {
  const firstRecord = {
    eventId: '1',
    eventVersion: '1.0',
    dynamodb: {
      Keys: {
        Id: {
          N: '123'
        }
      },
      NewImage: {
        Message: {
          S: 'goodbye'
        },
        Id: {
          N: '123'
        }
      },
      OldImage: {
        Message: {
          S: 'hello'
        },
        Id: {
          N: '123'
        }
      },
      StreamViewType: 'NEW_AND_OLD_IMAGES' as 'NEW_AND_OLD_IMAGES',
      SequenceNumber: '111',
      SizeBytes: 26
    },
    awsRegion: 'us-east-1',
    eventName: 'INSERT' as 'INSERT',
    eventSourceARN: 'arn:aws:dynamodb:us-east-1:1234567890:table/table',
    eventSource: 'aws-dynamodb'
  };
  const secondRecord = {
    eventId: '2',
    eventVersion: '1.0',
    dynamodb: {
      Keys: {
        Id: {
          N: '456'
        }
      },
      NewImage: {
        Message: {
          S: 'hasta la vista'
        },
        Id: {
          N: '456'
        }
      },
      StreamViewType: 'NEW_AND_OLD_IMAGES' as 'NEW_AND_OLD_IMAGES',
      SequenceNumber: '111',
      SizeBytes: 26
    },
    awsRegion: 'us-east-1',
    eventName: 'INSERT' as 'INSERT',
    eventSourceARN: 'arn:aws:dynamodb:us-east-1:1234567890:table/table',
    eventSource: 'aws-dynamodb'
  };
  const thirdRecord = {
    eventId: '1',
    eventVersion: '1.0',
    dynamodb: {
      Keys: {
        Id: {
          N: '789'
        }
      },
      OldImage: {
        Message: {
          S: 'buongiorno'
        },
        Id: {
          N: '789'
        }
      },
      StreamViewType: 'NEW_AND_OLD_IMAGES' as 'NEW_AND_OLD_IMAGES',
      SequenceNumber: '111',
      SizeBytes: 26
    },
    awsRegion: 'us-east-1',
    eventName: 'REMOVE' as 'REMOVE',
    eventSourceARN: 'arn:aws:dynamodb:us-east-1:1234567890:table/table',
    eventSource: 'aws-dynamodb'
  };
  const event = dynamoDBStreamEvent({ Records: [firstRecord, secondRecord, thirdRecord] });
  const stream = new DynamoDBStreamParser(event);
  const { newVersions, oldVersions, versions } = stream.getVersions();

  it('Gets new versions correctly', () => {
    expect(newVersions).toHaveLength(2);
    expect(newVersions).toContainEqual({ Message: 'goodbye', Id: 123 });
    expect(newVersions).toContainEqual({ Message: 'hasta la vista', Id: 456 });
  });

  it('Gets old versions correctly', () => {
    expect(oldVersions).toHaveLength(2);
    expect(oldVersions).toContainEqual({ Message: 'hello', Id: 123 });
    expect(oldVersions).toContainEqual({ Message: 'buongiorno', Id: 789 });
  });

  it('Gets versions correctly', () => {
    expect(versions).toHaveLength(3);
    expect(versions).toContainEqual({
      eventName: 'INSERT',
      keys: { Id: 123 },
      newVersion: { Id: 123, Message: 'goodbye' },
      oldVersion: { Id: 123, Message: 'hello' },
      tableArn: 'arn:aws:dynamodb:us-east-1:1234567890:table/table',
      tableName: 'table'
    });
    expect(versions).toContainEqual({
      eventName: 'INSERT',
      keys: { Id: 456 },
      newVersion: { Id: 456, Message: 'hasta la vista' },
      oldVersion: undefined,
      tableArn: 'arn:aws:dynamodb:us-east-1:1234567890:table/table',
      tableName: 'table'
    });
    expect(versions).toContainEqual({
      eventName: 'REMOVE',
      keys: { Id: 789 },
      newVersion: undefined,
      oldVersion: { Id: 789, Message: 'buongiorno' },
      tableArn: 'arn:aws:dynamodb:us-east-1:1234567890:table/table',
      tableName: 'table'
    });
  });
});
