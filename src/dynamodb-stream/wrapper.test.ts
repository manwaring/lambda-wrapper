import createEvent from '@serverless/event-mocks';
import { dynamodbStream } from './wrapper';

describe('DynamoDB Stream wrapper', () => {
  // @ts-ignore
  const event = createEvent('aws:dynamo', {});

  it('Handles success callback', () => {
    function mockHandler({ success }) {
      return success('success');
    }
    expect(dynamodbStream(mockHandler)(event)).toEqual('success');
  });

  it('Handles error callback', () => {
    function mockHandler({ error }) {
      return error('error');
    }
    expect(() => {
      dynamodbStream(mockHandler)(event);
    }).toThrow('error');
  });
});
