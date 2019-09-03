import createEvent from '@serverless/event-mocks';
import { SnsParser } from './parser';

describe('Stream parsing', () => {
  it('Parses string messages', () => {
    const Sns = {
      Message: 'hello world'
    };
    // @ts-ignore
    const event = createEvent('aws:sns', { Records: [{ Sns }] });
    const message = new SnsParser(event).getMessage();
    expect(message).toEqual('hello world');
  });

  it('Parses JSON stringified messages', () => {
    const Sns = {
      Message: JSON.stringify({ hello: 'world' })
    };
    // @ts-ignore
    const event = createEvent('aws:sns', { Records: [{ Sns }] });
    const message = new SnsParser(event).getMessage();
    expect(message).toEqual({ hello: 'world' });
  });
});
