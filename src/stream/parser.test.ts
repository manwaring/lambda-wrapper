import createEvent from '@serverless/event-mocks';
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
      StreamViewType: 'NEW_AND_OLD_IMAGES',
      SequenceNumber: '111',
      SizeBytes: 26
    },
    awsRegion: 'us-east-1',
    eventName: 'PUT',
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
      StreamViewType: 'NEW_AND_OLD_IMAGES',
      SequenceNumber: '111',
      SizeBytes: 26
    },
    awsRegion: 'us-east-1',
    eventName: 'INSERT',
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
      StreamViewType: 'NEW_AND_OLD_IMAGES',
      SequenceNumber: '111',
      SizeBytes: 26
    },
    awsRegion: 'us-east-1',
    eventName: 'DELETE',
    eventSourceARN: 'arn:aws:dynamodb:us-east-1:1234567890:table/table',
    eventSource: 'aws-dynamodb'
  };
  // @ts-ignore
  const event = createEvent('aws:dynamo', { Records: [firstRecord, secondRecord, thirdRecord] });
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
      newVersion: { Message: 'goodbye', Id: 123 },
      oldVersion: { Message: 'hello', Id: 123 },
      keys: { Id: 123 },
      tableName: 'table',
      tableArn: 'arn:aws:dynamodb:us-east-1:1234567890:table/table',
      eventName: 'PUT'
    });
    expect(versions).toContainEqual({
      newVersion: { Message: 'hasta la vista', Id: 456 },
      oldVersion: null,
      keys: { Id: 456 },
      tableName: 'table',
      tableArn: 'arn:aws:dynamodb:us-east-1:1234567890:table/table',
      eventName: 'INSERT'
    });
    expect(versions).toContainEqual({
      newVersion: null,
      oldVersion: { Message: 'buongiorno', Id: 789 },
      keys: { Id: 789 },
      tableName: 'table',
      tableArn: 'arn:aws:dynamodb:us-east-1:1234567890:table/table',
      eventName: 'DELETE'
    });
  });
});
