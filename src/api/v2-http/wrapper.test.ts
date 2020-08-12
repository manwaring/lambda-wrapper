import { HttpApiEvent } from 'serverless-plugin-test-helper';
import { httpApi, HttpApiSignature } from './wrapper';

describe('HTTP API wrapper', () => {
  const requestEvent = new HttpApiEvent({
    body: JSON.stringify({ hello: 'world' }),
    pathParameters: { proxy: 'not today' },
    queryStringParameters: { name: 'a test' },
    headers: { 'content-type': 'application/json', 'Test-Request': 'true' },
  });
  const context = {
    callbackWaitsForEmptyEventLoop: false,
    functionName: 'function-name',
    functionVersion: '$LATEST',
    invokedFunctionArn: 'arn:',
    memoryLimitInMB: '128',
    awsRequestId: 'request',
    logGroupName: 'group',
    logStreamName: 'stream',
    getRemainingTimeInMillis: () => 2,
    done: () => {},
    fail: () => {},
    succeed: () => {},
  };
  const callback = jest.fn((err, result) => (err ? new Error(err) : result));

  it('Has expected properties and response functions', () => {
    function custom({
      event,
      body,
      path,
      query,
      headers,
      testRequest,
      auth,
      success,
      notFound,
      notAuthorized,
      invalid,
      redirect,
      error,
    }: HttpApiSignature) {
      expect(event).toEqual(requestEvent);
      expect(body).toEqual({ hello: 'world' });
      expect(path['proxy']).toEqual('not today');
      expect(query['name']).toEqual('a test');
      expect(headers['content-type']).toEqual('application/json');
      expect(testRequest).toEqual(true);
      expect(auth).toBeTruthy();
      expect(success).toBeInstanceOf(Function);
      expect(notFound).toBeInstanceOf(Function);
      expect(notAuthorized).toBeInstanceOf(Function);
      expect(invalid).toBeInstanceOf(Function);
      expect(redirect).toBeInstanceOf(Function);
      expect(error).toBeInstanceOf(Function);
      success({ body: 'success' });
    }
    httpApi(custom)(requestEvent, context, callback);
  });

  it('Has expected properties and response functions with optional generic type', () => {
    interface CustomType {
      Message: string;
      Id: number;
    }
    function custom<CustomType>({
      event,
      body,
      path,
      query,
      headers,
      testRequest,
      auth,
      success,
      notFound,
      notAuthorized,
      invalid,
      redirect,
      error,
    }: HttpApiSignature<CustomType>) {
      expect(event).toEqual(requestEvent);
      expect(body).toEqual({ hello: 'world' });
      expect(path['proxy']).toEqual('not today');
      expect(query['name']).toEqual('a test');
      expect(headers['content-type']).toEqual('application/json');
      expect(testRequest).toEqual(true);
      expect(auth).toBeTruthy();
      expect(success).toBeInstanceOf(Function);
      expect(notFound).toBeInstanceOf(Function);
      expect(notAuthorized).toBeInstanceOf(Function);
      expect(invalid).toBeInstanceOf(Function);
      expect(redirect).toBeInstanceOf(Function);
      expect(error).toBeInstanceOf(Function);
      success({ body: 'success' });
    }
    httpApi(custom)(requestEvent, context, callback);
  });
});
