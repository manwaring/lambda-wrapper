import { stringify } from 'querystring';
import { HttpApiEvent } from 'serverless-plugin-test-helper';
import { Request, Body } from './parser';

describe('HTTP API Body parsing', () => {
  it('Parses json body', () => {
    const json = { hello: 'world' };
    const headers = { 'content-type': 'application/json' };
    const body = new Body(JSON.stringify(json), headers).getParsedBody();
    expect(body).toEqual(json);
  });

  it('Parses json body when charset is also defined in the content-type', () => {
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

  it('Parses form url encoded body when charset is also defined in the content-type', () => {
    const form = { hello: 'world' };
    const headers = { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' };
    const body = new Body(stringify(form), headers).getParsedBody();
    expect(body).toEqual(form);
  });

  it("Tries to parse body as JSON when content type isn't specified", () => {
    const json = { hello: 'world' };
    const headers = undefined;
    const body = new Body(JSON.stringify(json), headers).getParsedBody();
    expect(body).toEqual(json);
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

describe('Http API request parsing', () => {
  it('Gets all fields with optional parameters', () => {
    const event = new HttpApiEvent({
      body: JSON.stringify({ hello: 'world' }),
      rawPath: '/api/v1/nouns/id124',
      pathParameters: { proxy: 'not today' },
      rawQueryString: 'name=atest',
      queryStringParameters: { name: 'atest' },
      headers: { 'content-type': 'application/json', 'Test-Request': 'true' },
    });
    const { body, path, rawPath, query, rawQueryString, auth, headers, testRequest } = new Request(
      event
    ).getProperties();

    expect(body).toEqual({ hello: 'world' });
    expect(path['proxy']).toEqual(event.pathParameters.proxy);
    expect(rawPath).toEqual(event.rawPath);
    expect(query['name']).toEqual(event.queryStringParameters.name);
    expect(rawQueryString).toEqual(event.rawQueryString);
    expect(headers['content-type']).toEqual('application/json');
    expect(testRequest).toEqual(true);
    expect(auth).toBeTruthy();
  });

  it("Get's falsy fields when optional parameters not used", () => {
    const event = new HttpApiEvent();
    delete event.body;
    delete event.rawPath;
    delete event.headers;
    delete event.pathParameters;
    delete event.rawQueryString;
    delete event.queryStringParameters;
    const { body, path, rawPath, query, rawQueryString, auth, headers, testRequest } = new Request(
      event
    ).getProperties();

    expect(body).toBeFalsy();
    expect(path).toBeFalsy();
    expect(rawPath).toBeFalsy();
    expect(query).toBeFalsy();
    expect(rawQueryString).toBeFalsy();
    expect(auth).toBeTruthy();
    expect(headers).toBeFalsy();
    expect(testRequest).toBeFalsy();
  });

  it('Supports default values in method signature', () => {
    const event = new HttpApiEvent();
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
