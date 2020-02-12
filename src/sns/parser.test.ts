import { snsEvent } from 'serverless-plugin-test-helper';
import { SnsParser } from './parser';

describe('Stream parsing', () => {
  it('Parses string messages', () => {
    const Sns = {
      Message: 'hello world'
    };
    const event = snsEvent({ Records: [{ Sns }] });
    const message = new SnsParser(event).getMessage();
    expect(message).toEqual('hello world');
  });

  it('Parses JSON stringified messages', () => {
    const Sns = {
      Message: JSON.stringify({ hello: 'world' })
    };
    const event = snsEvent({ Records: [{ Sns }] });
    const message = new SnsParser(event).getMessage();
    expect(message).toEqual({ hello: 'world' });
  });
});
