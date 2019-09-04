import createEvent from '@serverless/event-mocks';
import { sns, SnsSignature } from './wrapper';

describe('Stream wrapper', () => {
  const Sns = {
    Message: 'hello world'
  };
  // @ts-ignore
  const requestEvent = createEvent('aws:sns', { Records: [{ Sns }] });

  it('Has expected properties and response funtions', () => {
    function mockHandler({ event, message, success, error }: SnsSignature) {
      expect(event).toEqual(requestEvent);
      expect(message).toEqual('hello world');
      expect(success).toBeInstanceOf(Function);
      expect(error).toBeInstanceOf(Function);
    }
    sns(mockHandler)(requestEvent);
  });
});
