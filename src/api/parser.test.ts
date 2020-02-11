import { stringify } from 'querystring';
import createEvent from '@serverless/event-mocks';
import { Request, Body } from './parser';

describe('Body parsing', () => {
  it('Parses json body', () => {
    const json = { hello: 'world' };
    const headers = { 'content-type': 'application/json' };
    const body = new Body(JSON.stringify(json), headers).getParsedBody();
    expect(body).toEqual(json);
  });

  it('Parses json body when charset is also defined in the context-type', () => {
    const json = { hello: 'world' };
    const headers = { 'content-type': 'application/json;charset=UTF-8' };
    const body = new Body(JSON.stringify(json), headers).getParsedBody();
    expect(body).toEqual(json);
  });

  it('Parses form url encoded body', () => {
    const form = { hello: 'world' };
    const headers = { 'content-type': 'application/x-www-form-urlencoded' };
    const body = new Body(stringify(form), headers).getParsedBody();
    expect(body).toEqual(form);
  });

  it("Passes body through when content type isn't specified", () => {
    const json = { hello: 'world' };
    const headers = {};
    const body = new Body(JSON.stringify(json), headers).getParsedBody();
    expect(body).toEqual(JSON.stringify(json));
  });

  it("Errors when encoding and content-type don't match", () => {
    const invalid = '2["test" : 123]4}{';
    const headers = { 'content-type': 'application/json' };
    const body = new Body(invalid, headers).getParsedBody();
    expect(body).toEqual(invalid);
  });

  it('Returns empty body when none given', () => {
    let empty;
    const headers = { 'content-type': 'application/x-www-form-urlencoded' };
    const body = new Body(empty, headers).getParsedBody();
    expect(body).toEqual(empty);
  });
});

describe('Request parsing', () => {
  it('Gets all fields with optional parameters', () => {
    // @ts-ignore
    const event = createEvent('aws:apiGateway', {
      body: JSON.stringify({ hello: 'world' }),
      pathParameters: { proxy: 'not today' },
      queryStringParameters: { name: 'a test' },
      headers: { 'content-type': 'application/json', 'Test-Request': 'true' }
    });
    const { body, path, query, auth, headers, testRequest } = new Request(event).getProperties();

    expect(body).toEqual({ hello: 'world' });
    expect(path).toEqual({ proxy: 'not today' });
    expect(query).toEqual({ name: 'a test' });
    expect(headers['content-type']).toEqual('application/json');
    expect(testRequest).toEqual(true);
    expect(auth).toBeFalsy();
  });

  it("Get's falsy fields when optional parameters not used", () => {
    // @ts-ignore
    const event = createEvent('aws:apiGateway', {});
    delete event.body;
    delete event.headers;
    delete event.pathParameters;
    delete event.queryStringParameters;
    const { body, path, query, auth, headers, testRequest } = new Request(event).getProperties();

    expect(body).toBeFalsy();
    expect(path).toBeFalsy();
    expect(query).toBeFalsy();
    expect(auth).toBeFalsy();
    expect(headers).toBeFalsy();
    expect(testRequest).toBeFalsy();
  });

  it('Supports default values in method signature', () => {
    // @ts-ignore
    const event = createEvent('aws:apiGateway', {});
    delete event.body;
    delete event.headers;
    delete event.pathParameters;
    delete event.queryStringParameters;
    const { path = {}, query = {} } = new Request(event).getProperties();

    const { notThere = 2 } = query;
    expect(notThere).toEqual(2);

    const { alsoNotThere = 3 } = path;
    expect(alsoNotThere).toEqual(3);
  });
});
