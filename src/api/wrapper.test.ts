import createEvent from '@serverless/event-mocks';
import { api, ApiSignature } from './wrapper';

describe('API wrapper', () => {
  // @ts-ignore
  const requestEvent = createEvent('aws:apiGateway', {
    body: JSON.stringify({ hello: 'world' }),
    pathParameters: { proxy: 'not today' },
    queryStringParameters: { name: 'a test' },
    headers: { 'content-type': 'application/json', 'Test-Request': 'true' }
  });
  const context = {};
  const callback = jest.fn((err, result) => (err ? new Error(err) : result));

  it('Has expected properties and response functions', () => {
    function mockHandler({
      event,
      body,
      path,
      query,
      headers,
      testRequest,
      auth,
      success,
      invalid,
      redirect,
      error
    }: ApiSignature) {
      expect(event).toEqual(requestEvent);
      expect(body).toEqual({ hello: 'world' });
      expect(path).toEqual({ proxy: 'not today' });
      expect(query).toEqual({ name: 'a test' });
      expect(headers['content-type']).toEqual('application/json');
      expect(testRequest).toEqual(true);
      expect(auth).toBeFalsy();
      expect(success).toBeInstanceOf(Function);
      expect(invalid).toBeInstanceOf(Function);
      expect(redirect).toBeInstanceOf(Function);
      expect(error).toBeInstanceOf(Function);
      success('success');
    }
    // @ts-ignore
    api(mockHandler)(requestEvent, context, callback);
  });
});
