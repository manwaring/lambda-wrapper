import { wrapper, WrapperSignature } from './wrapper';

describe('Stream wrapper', () => {
  const requestEvent = { hello: 'world' };

  it('Has expected properties and response funtions', () => {
    function mockHandler({ event, success, error }: WrapperSignature) {
      expect(event).toEqual(requestEvent);
      expect(success).toBeInstanceOf(Function);
      expect(error).toBeInstanceOf(Function);
    }
    // @ts-ignore
    wrapper(mockHandler)(requestEvent);
  });
});
