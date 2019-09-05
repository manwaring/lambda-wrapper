import { Responses } from './responses';
import { Metrics } from '../common';

describe('API responses', () => {
  const metrics = new Metrics('API Gateway');
  const callback = jest.fn((err, result) => (err ? new Error(err) : result));
  const responses = new Responses(metrics, callback);

  beforeEach(() => jest.resetAllMocks());

  it('Handles success response', () => {
    responses.success('success');
    expect(callback).toHaveBeenCalledWith(null, {
      body: JSON.stringify('success'),
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': true },
      statusCode: 200
    });
  });

  it('Handles success response without payload', () => {
    responses.success();
    expect(callback).toHaveBeenCalledWith(null, {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': true },
      statusCode: 200
    });
  });

  it('Handles error response', () => {
    responses.error('error');
    expect(callback).toHaveBeenCalledWith(new Error('error'));
  });

  it('Handles invalid response', () => {
    responses.invalid(['invalid']);
    expect(callback).toHaveBeenCalledWith(null, {
      body: JSON.stringify({ errors: ['invalid'] }),
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': true },
      statusCode: 400
    });
  });

  it('Handles invalid response without validation errors', () => {
    responses.invalid();
    expect(callback).toHaveBeenCalledWith(null, {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': true },
      statusCode: 400
    });
  });

  it('Handles redirect response', () => {
    responses.redirect('url');
    expect(callback).toHaveBeenCalledWith(null, {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': true, Location: 'url' },
      statusCode: 302
    });
  });
});
