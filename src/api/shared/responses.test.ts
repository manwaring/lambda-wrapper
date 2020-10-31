import { success, error, invalid, notFound, notAuthorized, redirect, custom } from './responses';

describe('API responses', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('Handles success response', () => {
    const response = success({ body: 'success' });
    expect(response).toEqual({
      body: JSON.stringify('success'),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Content-Type': 'application/json',
      },
      statusCode: 200,
    });
  });

  it('Handles success response without payload', () => {
    const response = success();
    expect(response).toEqual({
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': true },
      statusCode: 200,
    });
  });

  it('Handles success response without cors', () => {
    const response = success({ cors: false });
    expect(response).toEqual({
      statusCode: 200,
    });
  });

  it('Handles success response with non-json', () => {
    const body = '<svg width="20" height="20"></svg>';
    const response = success({
      body,
      json: false,
      headers: { 'Content-Type': 'image/svg+xml' },
    });
    expect(response).toEqual({
      body,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Content-Type': 'image/svg+xml',
      },
      statusCode: 200,
    });
  });

  it('Handles success response with non-json and no cors', () => {
    const body = '<svg width="20" height="20"></svg>';
    const response = success({
      body,
      json: false,
      cors: false,
      headers: { 'Content-Type': 'image/svg+xml' },
    });
    expect(response).toEqual({
      body,
      headers: {
        'Content-Type': 'image/svg+xml',
      },
      statusCode: 200,
    });
  });

  it('Handles success response with complex payload', () => {
    const body = { hello: 'world', replace: { that: 'property', not: 'this one' } };
    const response = success({ body });
    expect(response).toEqual({
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      statusCode: 200,
    });
  });

  it('Handles success response with custom headers', () => {
    const body = { hello: 'world', replace: { that: 'property', not: 'this one' } };
    const headers = { Custom: 'header' };
    const response = success({ body, headers });
    expect(response).toEqual({
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Content-Type': 'application/json',
        Custom: 'header',
      },
      body: JSON.stringify(body),
      statusCode: 200,
    });
  });

  it('Handles error response with raw error', () => {
    const response = error({ err: new Error('error') });
    expect(response).toEqual({
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      statusCode: 500,
    });
  });

  it('Handles error response with custom body', () => {
    const response = error({ body: 'error' });
    expect(response).toEqual({
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify('error'),
      statusCode: 500,
    });
  });

  it('Handles invalid response', () => {
    const response = invalid({ body: 'invalid' });
    expect(response).toEqual({
      body: JSON.stringify('invalid'),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Content-Type': 'application/json',
      },
      statusCode: 400,
    });
  });

  it('Handles invalid response without validation errors', () => {
    const response = invalid();
    expect(response).toEqual({
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      statusCode: 400,
    });
  });

  it('Handles custom response', () => {
    const response = custom({ statusCode: 418 });
    expect(response).toEqual({
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      statusCode: 418,
    });
  });

  it('Handles notFound response', () => {
    const response = notFound({ body: 'not found' });
    expect(response).toEqual({
      body: JSON.stringify('not found'),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Content-Type': 'application/json',
      },
      statusCode: 404,
    });
  });

  it('Handles basic notAuthorized response', () => {
    const response = notAuthorized();
    expect(response).toEqual({
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      statusCode: 401,
    });
  });

  it('Handles overridden notAuthorized response', () => {
    const response = notAuthorized({ body: 'not found' });
    expect(response).toEqual({
      body: JSON.stringify('not found'),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Content-Type': 'application/json',
      },
      statusCode: 401,
    });
  });

  it('Handles redirect response', () => {
    const response = redirect({ url: 'url' });
    expect(response).toEqual({
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        Location: 'url',
      },
      statusCode: 302,
    });
  });
});
