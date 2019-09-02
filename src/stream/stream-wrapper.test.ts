import createEvent from '@serverless/event-mocks';
import { streamWrapper } from './stream-wrapper';

describe('Stream wrapper', () => {
  // @ts-ignore
  const event = createEvent('aws:dynamo', {});

  it('Handles success callback', () => {
    function mockHandler({ success }) {
      return success('success');
    }
    expect(streamWrapper(mockHandler)(event)).toEqual('success');
  });

  it('Handles error callback', () => {
    function mockHandler({ error }) {
      return error('error');
    }
    expect(() => {
      streamWrapper(mockHandler)(event);
    }).toThrow('error');
  });
});
