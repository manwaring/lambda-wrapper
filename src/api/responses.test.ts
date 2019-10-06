import { successWrapper, errorWrapper, invalidWrapper, redirectWrapper } from './responses';
import { Metrics } from '../common';

describe('API responses', () => {
  const metrics = new Metrics('API Gateway');
  const callback = jest.fn((err, result) => (err ? new Error(err) : result));

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('Handles success response', () => {
    const success = successWrapper(metrics, callback);
    success('success');
    expect(callback).toHaveBeenCalledWith(null, {
      body: JSON.stringify('success'),
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': true },
      statusCode: 200
    });
  });

  it('Handles success response without payload', () => {
    const success = successWrapper(metrics, callback);
    success();
    expect(callback).toHaveBeenCalledWith(null, {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': true },
      statusCode: 200
    });
  });

  it('Handles success response with replacer', () => {
    const success = successWrapper(metrics, callback);
    const replacer = (key, value) => {
      switch (key) {
        case 'that':
          return undefined;
        default:
          return value;
      }
    };
    success({ hello: 'world', replace: { that: 'property', not: 'this one' } }, replacer);
    expect(callback).toHaveBeenCalledWith(null, {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': true },
      body: JSON.stringify({ hello: 'world', replace: { not: 'this one' } }),
      statusCode: 200
    });
  });

  it('Handles error response', () => {
    const error = errorWrapper(metrics, callback);
    error('error');
    expect(callback).toHaveBeenCalledWith('error');
  });

  it('Handles invalid response', () => {
    const invalid = invalidWrapper(metrics, callback);
    invalid(['invalid']);
    expect(callback).toHaveBeenCalledWith(null, {
      body: JSON.stringify({ errors: ['invalid'] }),
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': true },
      statusCode: 400
    });
  });

  it('Handles invalid response without validation errors', () => {
    const invalid = invalidWrapper(metrics, callback);
    invalid();
    expect(callback).toHaveBeenCalledWith(null, {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': true },
      statusCode: 400
    });
  });

  it('Handles redirect response', () => {
    const redirect = redirectWrapper(metrics, callback);
    redirect('url');
    expect(callback).toHaveBeenCalledWith(null, {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': true, Location: 'url' },
      statusCode: 302
    });
  });
});
