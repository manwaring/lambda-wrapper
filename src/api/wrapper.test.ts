import { apiGatewayEvent } from 'serverless-plugin-test-helper';
import { api, ApiSignature } from './wrapper';

describe('API wrapper', () => {
  const requestEvent = apiGatewayEvent({
    body: JSON.stringify({ hello: 'world' }),
    pathParameters: { proxy: 'not today' },
    queryStringParameters: { name: 'a test' },
    headers: { 'content-type': 'application/json', 'Test-Request': 'true' }
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
    succeed: () => {}
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
      expect(notFound).toBeInstanceOf(Function);
      expect(notAuthorized).toBeInstanceOf(Function);
      expect(invalid).toBeInstanceOf(Function);
      expect(redirect).toBeInstanceOf(Function);
      expect(error).toBeInstanceOf(Function);
      success('success');
    }
    api(custom)(requestEvent, context, callback);
  });
});
