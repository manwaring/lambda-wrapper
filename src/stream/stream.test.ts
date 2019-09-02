import createEvent from '@serverless/event-mocks';
import { Stream } from './stream';

describe('Stream parsing', () => {
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
      OldImage: {
        Message: {
          S: 'hola'
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
    eventName: 'PUT',
    eventSourceARN: 'arn:aws:dynamodb:us-east-1:1234567890:table/table',
    eventSource: 'aws-dynamodb'
  };
  // @ts-ignore
  const event = createEvent('aws:dynamo', { Records: [firstRecord, secondRecord] });
  const stream = new Stream(event);
  const { newVersions, oldVersions, versions } = stream.getVersions();

  it('Gets new versions correctly', () => {
    const firstVersion = { Message: 'goodbye', Id: 123 };
    const secondVersion = { Message: 'hasta la vista', Id: 456 };
    expect(newVersions).toHaveLength(2);
    expect(newVersions).toContainEqual(firstVersion);
    expect(newVersions).toContainEqual(secondVersion);
  });

  it('Gets old versions correctly', () => {
    const firstVersion = { Message: 'hello', Id: 123 };
    const secondVersion = { Message: 'hola', Id: 456 };
    expect(oldVersions).toHaveLength(2);
    expect(oldVersions).toContainEqual(firstVersion);
    expect(oldVersions).toContainEqual(secondVersion);
  });

  it('Gets versions correctly', () => {
    const firstVersion = {
      newVersion: { Message: 'goodbye', Id: 123 },
      oldVersion: { Message: 'hello', Id: 123 },
      keys: { Id: 123 },
      tableName: 'table',
      tableArn: 'arn:aws:dynamodb:us-east-1:1234567890:table/table',
      eventName: 'PUT'
    };
    const secondVersion = {
      newVersion: { Message: 'hasta la vista', Id: 456 },
      oldVersion: { Message: 'hola', Id: 456 },
      keys: { Id: 456 },
      tableName: 'table',
      tableArn: 'arn:aws:dynamodb:us-east-1:1234567890:table/table',
      eventName: 'PUT'
    };

    expect(versions).toHaveLength(2);
    expect(versions).toContainEqual(firstVersion);
    expect(versions).toContainEqual(secondVersion);
  });
});
