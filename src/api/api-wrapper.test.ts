import createEvent from '@serverless/event-mocks';
import { apiWrapper, ApiSignature } from './api-wrapper';

describe('API wrapper', () => {
  // @ts-ignore
  const event = createEvent('aws:apiGateway', {});

  it('Handles success callback', () => {
    function mockHandler({ success }: ApiSignature) {
      return success('success');
    }
    expect(apiWrapper(mockHandler)(event)).toEqual({
      body: JSON.stringify('success'),
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': true },
      statusCode: 200
    });
  });

  it('Handles error callback', () => {
    function mockHandler({ error }: ApiSignature) {
      return error('error');
    }
    expect(() => {
      apiWrapper(mockHandler)(event);
    }).toThrow('error');
  });

  it('Handles invalid callback', () => {
    function mockHandler({ invalid }: ApiSignature) {
      return invalid(['invalid']);
    }
    expect(apiWrapper(mockHandler)(event)).toEqual({
      body: JSON.stringify({ errors: ['invalid'], event }),
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': true },
      statusCode: 400
    });
  });

  it('Handles redirect callback', () => {
    function mockHandler({ redirect }: ApiSignature) {
      return redirect('url');
    }
    expect(apiWrapper(mockHandler)(event)).toEqual({
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': true, Location: 'url' },
      statusCode: 302
    });
  });
});
