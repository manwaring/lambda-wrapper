import { stringify } from 'querystring';
import { Body } from './body';

it('Parses json body correctly', () => {
  const json = { hello: 'world' };
  const headers = { 'content-type': 'application/json' };
  const body = new Body(JSON.stringify(json), headers).getParsedBody();
  expect(body).toEqual(json);
});

it('Parses form url encoded body correctly', () => {
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
  const empty;
  const headers = { 'content-type': 'application/x-www-form-urlencoded' };
  const body = new Body(empty, headers).getParsedBody();
  expect(body).toEqual(empty);
});
