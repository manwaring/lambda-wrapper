import { success, error, invalid, notFound, notAuthorized, redirect } from './responses';

describe('API responses', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('Handles success response', () => {
    const response = success('success');
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

  it('Handles success response with replacer', () => {
    const replacer = (key, value) => {
      switch (key) {
        case 'that':
          return undefined;
        default:
          return value;
      }
    };
    const response = success({ hello: 'world', replace: { that: 'property', not: 'this one' } }, replacer);
    expect(response).toEqual({
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ hello: 'world', replace: { not: 'this one' } }),
      statusCode: 200,
    });
  });

  it('Handles error response', () => {
    const response = error(new Error('error'));
    expect(response).toEqual({
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: 'error' }),
      statusCode: 500,
    });
  });

  it('Handles invalid response', () => {
    const response = invalid(['invalid']);
    expect(response).toEqual({
      body: JSON.stringify({ errors: ['invalid'] }),
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

  it('Handles notFound response', () => {
    const response = notFound('not found');
    expect(response).toEqual({
      body: JSON.stringify({ message: 'not found' }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Content-Type': 'application/json',
      },
      statusCode: 404,
    });
  });

  it('Handles notAuthorized response', () => {
    const response = notAuthorized('not found');
    expect(response).toEqual({
      body: JSON.stringify({ message: 'not found' }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Content-Type': 'application/json',
      },
      statusCode: 401,
    });
  });

  it('Handles redirect response', () => {
    const response = redirect('url');
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
