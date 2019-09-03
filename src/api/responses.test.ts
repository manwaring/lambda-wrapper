import createEvent from '@serverless/event-mocks';
import { success, error, invalid, redirect } from './responses';

describe('API responses', () => {
  // @ts-ignore
  const event = createEvent('aws:apiGateway', {});

  it('Handles success response', () => {
    expect(success('success')).toEqual({
      body: JSON.stringify('success'),
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': true },
      statusCode: 200
    });
  });

  it('Handles success response without payload', () => {
    expect(success()).toEqual({
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': true },
      statusCode: 200
    });
  });

  it('Handles error response', () => {
    expect(() => error('error')).toThrow('error');
  });

  it('Handles invalid response', () => {
    expect(invalid(['invalid'])).toEqual({
      body: JSON.stringify({ errors: ['invalid'] }),
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': true },
      statusCode: 400
    });
  });

  it('Handles invalid response without validation errors', () => {
    expect(invalid()).toEqual({
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': true },
      statusCode: 400
    });
  });

  it('Handles redirect response', () => {
    expect(redirect('url')).toEqual({
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': true, Location: 'url' },
      statusCode: 302
    });
  });
});
