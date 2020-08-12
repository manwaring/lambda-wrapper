<p align="center">
  <img height="150" src="https://d1wzvcwrgjaybe.cloudfront.net/repos/manwaring/lambda-wrapper/readme-category-icon.png">
  <img height="150" src="https://d1wzvcwrgjaybe.cloudfront.net/repos/manwaring/lambda-wrapper/readme-repo-icon.png">
</p>

<p align="center">
  <a href="https://npmjs.com/package/@manwaring/lambda-wrapper">
    <img src="https://flat.badgen.net/npm/v/@manwaring/lambda-wrapper?icon=npm&label=@latest"></a>
  <a href="https://www.npmjs.com/package/@manwaring/lambda-wrapper">
    <img src="https://flat.badgen.net/npm/dt/@manwaring/lambda-wrapper?icon=npm"></a>
  <a href="https://codecov.io/gh/manwaring/lambda-wrapper">
    <img src="https://flat.badgen.net/codecov/c/github/manwaring/lambda-wrapper/?icon=codecov"></a>
  <a href="https://packagephobia.now.sh/result?p=@manwaring/lambda-wrapper">
    <img src="https://flat.badgen.net/packagephobia/install/@manwaring/lambda-wrapper?icon=packagephobia"></a>
  <a href="https://www.npmjs.com/package/@manwaring/lambda-wrapper">
    <img src="https://flat.badgen.net/github/license/manwaring/lambda-wrapper"></a>
</p>

<p align="center">
  <a href="https://circleci.com/gh/manwaring/lambda-wrapper">
    <img src="https://flat.badgen.net/circleci/github/manwaring/lambda-wrapper/master?icon=circleci"></a>
  <a href="https://flat.badgen.net/dependabot/manwaring/lambda-wrapper">
    <img src="https://flat.badgen.net/dependabot/manwaring/lambda-wrapper/?icon=dependabot&label=dependabot"></a>
  <a href="https://david-dm.org/manwaring/lambda-wrapper">
    <img src="https://flat.badgen.net/david/dep/manwaring/lambda-wrapper"></a>
  <a href="https://david-dm.org/manwaring/lambda-wrapper?type=dev">
    <img src="https://flat.badgen.net/david/dev/manwaring/lambda-wrapper/?label=dev+dependencies"></a>
</p>

# AWS Lambda wrapper library

### This documentation is for v4 of the library - [go here for v1](old-docs/v1/README.md), [here for v2](old-docs/v2/README.md), and [here for v3](old-docs/v3/README.md).

1. [Overview](#overview)
1. [Installation and setup](#installation-and-setup)
   - [Optional configuration](#optional-configuration)
1. [Supported events](#supported-events)
   - [API Gateway](#api-gateway)
   - [API Gateway HTTP API](#api-gateway-http-api)
   - [CloudFormation Custom Resource](#cloudformation-custom-resource)
   - [DynamoDB Stream](#dynamodb-stream)
   - [Lambda Authorizer](#lambda-authorizer)
   - [SNS](#sns)
   - [Generic event](#generic-event)
1. [Example projects](#example-projects)

# Overview

### TL;DR

This library provides custom Lambda function wrappers which expose standard, abstracted functionality so that developers can focus on writing business logic instead of parsing event payloads and crafting response objects.

### Rationale and motivation

AWS Lambda supports a wide variety of event triggers, each with unique payloads and expected response objects. The Lambda method signature, however, only provides a raw event object and has no included mechanisms for simplifying payload parsing or response object creation. For example, API Gateway events include only the raw request body, leaving it up to developers to implement parsing themselves. Similarly, the developer is responsible for creating a response object which includes the correct HTTP status code and headers. This library exposes helpful abstractions like parsed HTTP bodies based on content-type headers, and success functions which create response objects with the correct status codes and headers for returning to API Gateway.

_Feedback is much appreciated! If you have an idea for how this library can be improved (or just a complaint/criticism) then [please open an issue](https://github.com/manwaring/lambda-wrapper/issues/new)._

# Installation and setup

Install and save the package:

`npm i -S @manwaring/lambda-wrapper`

`yarn add @manwaring/lambda-wrapper`

## Optional configuration

If you want the wrapper to log request and response messages (helpful for debugging) set an environemnt variable for `LAMBDA_WRAPPER_LOG=true`.

If you want each invocation to be tagged with the AWS region, stage/environment, and Git revision simply set environment variables for each and the library will pick them up: `REGION=us-east-1`, `STAGE=prod`, `REVISION=f4ba682`. See [git-rev-sync](https://www.npmjs.com/package/git-rev-sync) and [serverless-plugin-git-variables](https://www.npmjs.com/package/serverless-plugin-git-variables) for libraries that can help you set git revision automatically.

# Supported events

All of the events bellow have a corresponding wrapper which provides a deconstructable method signature exposing parsed/unmarshalled request parameters and helper response methods.

1. [API Gateway](#api-gateway)
1. [API Gateway HTTP API](#api-gateway-http-api)
1. [CloudFormation Custom Resource](#cloudformation-custom-resource)
1. [DynamoDB Stream](#dynamodb-stream)
1. [Lambda Authorizer](#lambda-authorizer)
1. [SNS](#sns)
1. [Generic event](#generic-event) (a basic wrapper with support for success and failure responses)

# API Gateway

## Sample TypeScript implementation

```ts
import { api } from '@manwaring/lambda-wrapper';
import { CustomInterface } from './custom-interface';

export const handler = api<CustomInterface>(async ({ body, path, success, invalid, error }) => {
  try {
    const { pathParam1, pathParam2 } = path;
    if (!pathParam1) {
      return invalid();
    }
    const results = await doSomething(body, pathParam1, pathParam2);
    return success({ body: results });
  } catch (err) {
    return error({ err });
  }
});
```

By passing in CustomInterface as a generic type the method signature will cast the `body` object as an instance of CustomInterface, making TypeScript development easier (note that the generic is not required and the body parameter defaults to type `any`)

## Properties and methods available on wrapper signature

<details open>
<summary>Deconstructable wrapper signature</summary>

Note that all properties are undefined if not present on the original request.

```ts
export interface ApiSignature<T = any> {
  event: APIGatewayEvent; // original event provided by AWS
  body: T; // body payload parsed according to content-type headers (or raw if no content-type headers found) and cast as T if provided (defaults to `any`)
  websocket: WebsocketRequest; // websocket connection payload
  path: { [name: string]: string }; // path params as key-value pairs
  query: { [name: string]: string }; // query params as key-value pairs
  headers: { [name: string]: string }; // headers as key-value pairs
  testRequest: boolean; // indicates if this is a test request - looks for a header matching process.env.TEST_REQUEST_HEADER (dynamic from application) or 'Test-Request' (default)
  auth: any; // auth context from custom authorizer
  success(paramaters: ResponseParameters): ApiResponse;
  invalid(paramaters: ResponseParameters): ApiResponse;
  notFound(paramaters: ResponseParameters): ApiResponse;
  notAuthorized(paramaters: ResponseParameters): ApiResponse;
  redirect(parameters: RedirectParameters): ApiResponse;
  error(parameters: ErrorParameters): ApiResponse;
}
```

</details>

<details>
<summary>ApiResponse</summary>

```ts
interface ApiResponse {
  statusCode: number;
  headers: { [name: string]: any };
  body?: string;
}
```

</details>

<details>
<summary>ResponseParameters</summary>

```ts
interface ResponseParameters {
  body?: any; // response body
  json?: boolean; // indicates if body should be JSON-stringified and content-type header set to application/json, defaults to true
  cors?: boolean; // indicates if CORS headers should be added, defaults to true
  statusCode?: number; // status code to return, defaults by callback (success: 200, invalid: 400, notFound: 404, notAuthorized: 401, redirect: 302, error: 500)
  headers?: { [key: string]: any }; // custom headers to include
}
```

</details>

<details>
<summary>RedirectParameters</summary>

```ts
interface RedirectParameters {
  url: string; // url to redirect to
  cors?: boolean; // indicates if CORS headers should be added, defaults to true
  statusCode?: number; // status code to return, defaults to 302
  headers?: { [key: string]: any }; // custom headers to include
}
```

</details>

<details>
<summary>ErrorParameters</summary>

```ts
interface ErrorParameters {
  body?: any; // response body
  json?: boolean; // indicates if body should be JSON-stringified and content-type header set to application/json, defaults to true
  cors?: boolean; // indicates if CORS headers should be added, defaults to true
  statusCode?: number; // status code to return, defaults to 500
  headers?: { [key: string]: any }; // custom headers to include
  err?: Error; // optional Error object for automatic logging
}
```

</details>

<details>
<summary>WebsocketRequest</summary>

```ts
export interface WebsocketRequest {
  accountId: string;
  apiId: string;
  connectedAt?: number;
  connectionId?: string;
  domainName?: string;
  domainPrefix?: string;
  eventType?: string;
  extendedRequestId?: string;
  protocol: string;
  httpMethod: string;
  identity: APIGatewayEventIdentity;
  messageDirection?: string;
  messageId?: string | null;
  path: string;
  stage: string;
  requestId: string;
  requestTime?: string;
  requestTimeEpoch: number;
  resourceId: string;
  resourcePath: string;
  routeKey?: string;
}
```

</details>

## Response functions

<details open>
<summary>Success</summary>

### Available parameters

```ts
{
  body?: any,
  json?: boolean,
  cors?: boolean,
  statusCode?: number,
  headers?: { [key: string]: any}
}
```

### Default parameters

```ts
{
  json: true,
  cors: true,
  statusCode: 200
}
```

### Invocation with defaults

```ts
const response = { hello: 'world' };
return success({ body: response });

// returns
{
  body: "{\"hello\":\"world\"}",
  statusCode: 200,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Content-Type': 'application/json'
  }
}
```

### Invocation overriding defaults

```ts
const response = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';
const headers = { 'Content-Type': 'image/svg+xml' };
return success({ body: response, json: false, cors: false, headers });

// returns
{
  body: "<svg xmlns=\"http://www.w3.org/2000/svg\"></svg>",
  statusCode: 200,
  headers: { 'Content-Type': 'image/svg+xml' }
}
```

</details>

<details>
<summary>Invalid</summary>

### Available parameters

```ts
{
  body?: any,
  json?: boolean,
  cors?: boolean,
  statusCode?: number,
  headers?: { [key: string]: any}
}
```

### Default parameters

```ts
{
  json: true,
  cors: true,
  statusCode: 400
}
```

### Invocation with defaults

```ts
return invalid();

// returns
{
  statusCode: 400,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
  }
}
```

### Invocation overriding defaults

```ts
const response = { invalid: 'properties' };
return invalid({ body: response, cors: false });

// returns
{
  body: "{\"invalid\":\"properties\"}",
  statusCode: 400,
  headers: { 'Content-Type': 'application/json' }
}
```

</details>

<details>
<summary>Not found</summary>

### Available parameters

```ts
{
  body?: any,
  json?: boolean,
  cors?: boolean,
  statusCode?: number,
  headers?: { [key: string]: any}
}
```

### Default parameters

```ts
{
  json: true,
  cors: true,
  statusCode: 404
}
```

### Invocation with defaults

```ts
return notFound();

// returns
{
  statusCode: 404,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
  }
}
```

### Invocation overriding defaults

```ts
const response = 'Not found';
return notFound({ body: response, cors: false });

// returns
{
  body: "Not found",
  statusCode: 404,
}
```

</details>

<details>
<summary>Not authorized</summary>

### Available parameters

```ts
{
  body?: any,
  json?: boolean,
  cors?: boolean,
  statusCode?: number,
  headers?: { [key: string]: any}
}
```

### Default parameters

```ts
{
  json: true,
  cors: true,
  statusCode: 401
}
```

### Invocation with defaults

```ts
return notAuthorized();

// returns
{
  statusCode: 401,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
  }
}
```

### Invocation overriding defaults

```ts
const response = 'Not authorized';
return notAuthorized({ body: response, cors: false });

// returns
{
  body: "Not Authorized",
  statusCode: 401,
}
```

</details>

<details>
<summary>Redirect</summary>

### Available parameters

```ts
{
  url: string,
  cors?: boolean,
  statusCode?: number,
  headers?: { [key: string]: any}
}
```

### Default parameters

```ts
{
  cors: true,
  statusCode: 302
}
```

### Invocation with defaults

```ts
const url = 'https://github.com/manwaring/lambda-wrapper';
return redirect({ url });

// returns
{
  statusCode: 302,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Location': 'https://github.com/manwaring/lambda-wrapper'
  }
}
```

### Invocation overriding defaults

```ts
const url = 'https://github.com/manwaring/lambda-wrapper';
return redirect({ url, statusCode: 308, cors: false });

// returns
{
  statusCode: 308,
  headers: {
    'Location': 'https://github.com/manwaring/lambda-wrapper'
  }
}
```

</details>

<details>
<summary>Error</summary>

### Available parameters

```ts
{
  body?: any,
  json?: boolean,
  cors?: boolean,
  statusCode?: number,
  headers?: { [key: string]: any},
  err?: Error;
}
```

### Default parameters

```ts
{
  json: true,
  cors: true,
  statusCode: 500
}
```

### Invocation with defaults

```ts
return error();

// returns
{
  statusCode: 500,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
  }
}
```

### Invocation overriding defaults

```ts
catch (err) {
  const body = { error: 'Unexpected error' };
  return error({ body, err });
}

// logs
console.debug(err);

// returns
{
  body: "{\"error\": \"Unexpected error\"}",
  statusCode: 500,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
  }
}
```

</details>

# API Gateway HTTP API

Note that other than the raw payload from AWS the HTTP API method signature and response functions match the API Gateway signature and functions. Hooray for wrappers!

## Sample TypeScript implementation

```ts
import { httpApi } from '@manwaring/lambda-wrapper';
import { CustomInterface } from './custom-interface';

export const handler = httpApi<CustomInterface>(async ({ body, path, success, invalid, error }) => {
  try {
    const { pathParam1, pathParam2 } = path;
    if (!pathParam1) {
      return invalid();
    }
    const results = await doSomething(body, pathParam1, pathParam2);
    return success({ body: results });
  } catch (err) {
    return error({ err });
  }
});
```

By passing in CustomInterface as a generic type the method signature will cast the `body` object as an instance of CustomInterface, making TypeScript development easier (note that the generic is not required and the body parameter defaults to type `any`)

## Properties and methods available on wrapper signature

<details open>
<summary>Deconstructable wrapper signature</summary>

Note that all properties are undefined if not present on the original request.

```ts
export interface HttpApiSignature<T = any> {
  event: HttpApiEvent; // original event provided by AWS
  body: T; // body payload parsed according to content-type headers (or raw if no content-type headers found) and cast as T if provided (defaults to `any`)
  path: { [name: string]: string }; // path params as key-value pairs
  query: { [name: string]: string }; // query params as key-value pairs
  headers: { [name: string]: string }; // headers as key-value pairs
  testRequest: boolean; // indicates if this is a test request - looks for a header matching process.env.TEST_REQUEST_HEADER (dynamic from application) or 'Test-Request' (default)
  auth: any; // auth context from JWT authorizer
  success(paramaters: ResponseParameters): ApiResponse;
  invalid(paramaters: ResponseParameters): ApiResponse;
  notFound(paramaters: ResponseParameters): ApiResponse;
  notAuthorized(paramaters: ResponseParameters): ApiResponse;
  redirect(parameters: RedirectParameters): ApiResponse;
  error(parameters: ErrorParameters): ApiResponse;
}
```

</details>

<details>
<summary>ApiResponse</summary>

```ts
interface ApiResponse {
  statusCode: number;
  headers: { [name: string]: any };
  body?: string;
}
```

</details>

<details>
<summary>ResponseParameters</summary>

```ts
interface ResponseParameters {
  body?: any; // response body
  json?: boolean; // indicates if body should be JSON-stringified and content-type header set to application/json, defaults to true
  cors?: boolean; // indicates if CORS headers should be added, defaults to true
  statusCode?: number; // status code to return, defaults by callback (success: 200, invalid: 400, notFound: 404, notAuthorized: 401, redirect: 302, error: 500)
  headers?: { [key: string]: any }; // custom headers to include
}
```

</details>

<details>
<summary>RedirectParameters</summary>

```ts
interface RedirectParameters {
  url: string; // url to redirect to
  cors?: boolean; // indicates if CORS headers should be added, defaults to true
  statusCode?: number; // status code to return, defaults to 302
  headers?: { [key: string]: any }; // custom headers to include
}
```

</details>

<details>
<summary>ErrorParameters</summary>

```ts
interface ErrorParameters {
  body?: any; // response body
  json?: boolean; // indicates if body should be JSON-stringified and content-type header set to application/json, defaults to true
  cors?: boolean; // indicates if CORS headers should be added, defaults to true
  statusCode?: number; // status code to return, defaults to 500
  headers?: { [key: string]: any }; // custom headers to include
  err?: Error; // optional Error object for automatic logging
}
```

</details>

<details>
<summary>HttpApiEvent</summary>

_[AWS documentation of raw event](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html#http-api-develop-integrations-lambda.proxy-format)_

```ts
export interface HttpApiEvent {
  version: string;
  routeKey: string;
  rawPath: string;
  rawQueryString: string;
  cookies: string[];
  headers: { [key: string]: string };
  queryStringParameters: { [key: string]: string };
  requestContext: {
    accountId: string;
    apiId: string;
    authorizer: {
      jwt: {
        claims: { [key: string]: string };
        scopes: string[];
      };
    };
    domainName: string;
    domainPrefix: string;
    http: {
      method: string;
      path: string;
      protocol: string;
      sourceIp: string;
      userAgent: string;
    };
    requestId: string;
    routeKey: string;
    stage: string;
    time: string;
    timeEpoch: number;
  };
  body: string;
  pathParameters: { [key: string]: string };
  isBase64Encoded: boolean;
  stageVariables: { [key: string]: string };
}
```

</details>

## Response functions

<details open>
<summary>Success</summary>

### Available parameters

```ts
{
  body?: any,
  json?: boolean,
  cors?: boolean,
  statusCode?: number,
  headers?: { [key: string]: any}
}
```

### Default parameters

```ts
{
  json: true,
  cors: true,
  statusCode: 200
}
```

### Invocation with defaults

```ts
const response = { hello: 'world' };
return success({ body: response });

// returns
{
  body: "{\"hello\":\"world\"}",
  statusCode: 200,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Content-Type': 'application/json'
  }
}
```

### Invocation overriding defaults

```ts
const response = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';
const headers = { 'Content-Type': 'image/svg+xml' };
return success({ body: response, json: false, cors: false, headers });

// returns
{
  body: "<svg xmlns=\"http://www.w3.org/2000/svg\"></svg>",
  statusCode: 200,
  headers: { 'Content-Type': 'image/svg+xml' }
}
```

</details>

<details>
<summary>Invalid</summary>

### Available parameters

```ts
{
  body?: any,
  json?: boolean,
  cors?: boolean,
  statusCode?: number,
  headers?: { [key: string]: any}
}
```

### Default parameters

```ts
{
  json: true,
  cors: true,
  statusCode: 400
}
```

### Invocation with defaults

```ts
return invalid();

// returns
{
  statusCode: 400,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
  }
}
```

### Invocation overriding defaults

```ts
const response = { invalid: 'properties' };
return invalid({ body: response, cors: false });

// returns
{
  body: "{\"invalid\":\"properties\"}",
  statusCode: 400,
  headers: { 'Content-Type': 'application/json' }
}
```

</details>

<details>
<summary>Not found</summary>

### Available parameters

```ts
{
  body?: any,
  json?: boolean,
  cors?: boolean,
  statusCode?: number,
  headers?: { [key: string]: any}
}
```

### Default parameters

```ts
{
  json: true,
  cors: true,
  statusCode: 404
}
```

### Invocation with defaults

```ts
return notFound();

// returns
{
  statusCode: 404,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
  }
}
```

### Invocation overriding defaults

```ts
const response = 'Not found';
return notFound({ body: response, cors: false });

// returns
{
  body: "Not found",
  statusCode: 404,
}
```

</details>

<details>
<summary>Not authorized</summary>

### Available parameters

```ts
{
  body?: any,
  json?: boolean,
  cors?: boolean,
  statusCode?: number,
  headers?: { [key: string]: any}
}
```

### Default parameters

```ts
{
  json: true,
  cors: true,
  statusCode: 401
}
```

### Invocation with defaults

```ts
return notAuthorized();

// returns
{
  statusCode: 401,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
  }
}
```

### Invocation overriding defaults

```ts
const response = 'Not authorized';
return notAuthorized({ body: response, cors: false });

// returns
{
  body: "Not Authorized",
  statusCode: 401,
}
```

</details>

<details>
<summary>Redirect</summary>

### Available parameters

```ts
{
  url: string,
  cors?: boolean,
  statusCode?: number,
  headers?: { [key: string]: any}
}
```

### Default parameters

```ts
{
  cors: true,
  statusCode: 302
}
```

### Invocation with defaults

```ts
const url = 'https://github.com/manwaring/lambda-wrapper';
return redirect({ url });

// returns
{
  statusCode: 302,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Location': 'https://github.com/manwaring/lambda-wrapper'
  }
}
```

### Invocation overriding defaults

```ts
const url = 'https://github.com/manwaring/lambda-wrapper';
return redirect({ url, statusCode: 308, cors: false });

// returns
{
  statusCode: 308,
  headers: {
    'Location': 'https://github.com/manwaring/lambda-wrapper'
  }
}
```

</details>

<details>
<summary>Error</summary>

### Available parameters

```ts
{
  body?: any,
  json?: boolean,
  cors?: boolean,
  statusCode?: number,
  headers?: { [key: string]: any},
  err?: Error;
}
```

### Default parameters

```ts
{
  json: true,
  cors: true,
  statusCode: 500
}
```

### Invocation with defaults

```ts
return error();

// returns
{
  statusCode: 500,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
  }
}
```

### Invocation overriding defaults

```ts
catch (err) {
  const body = { error: 'Unexpected error' };
  return error({ body, err });
}

// logs
console.debug(err);

// returns
{
  body: "{\"error\": \"Unexpected error\"}",
  statusCode: 500,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
  }
}
```

</details>

# CloudFormation Custom Resource

## Sample TypeScript implementation

```ts
import { cloudFormation } from '@manwaring/lambda-wrapper';

export const handler = cloudFormation(({ event, success, failure }) => {
  try {
    const { BucketName } = event.ResourceProperties;
    return success();
  } catch (err) {
    return failure(err);
  }
});
```

\*Note that currently the method wrapped by cloudFormation cannot be async - for reasons that aren't entirely clear to me when the method is async the requests to update CloudFormation with the correct action status fail, leaving a stack in the 'pending' state

## Properties and methods available on wrapper signature

```ts
interface CloudFormationSignature {
  event: CloudFormationCustomResourceEvent; // original event
  success(payload?: any): void; // sends CloudFormation success event
  failure(message?: any): void; // sends CloudFormation failure event
}
```

# DynamoDB Stream

## Sample TypeScript implementation

```ts
import { dynamodbStream } from '@manwaring/lambda-wrapper';
import { CustomInterface } from './custom-interface';

// By passing in CustomInterface as a generic the async method signature will correctly identify newVersions as an array of CustomInterface, making TypeScript development easier (note that the generic is not required in JavaScript projects)
export const handler = dynamodbStream<CustomInterface>(async ({ newVersions, success, error }) => {
  try {
    newVersions.forEach((version) => console.log(version));
    return success(newVersions);
  } catch (err) {
    return error(err);
  }
});

interface CustomInterface {
  id: number;
  value: string;
}
```

## Properties and methods available on wrapper signature

```ts
interface DynamoDBStreamSignature<T> {
  event: DynamoDBStreamEvent; // original event
  newVersions: T[]; // array of all unmarshalled javascript objects of new images
  oldVersions: T[]; // array of all unmarshalled javascript objects of old images
  versions: Version<T>[]; // array of full version object (new image, old image, etc - see Version interface)
  success(message?: any): any; // logs and returns the message
  error(error?: any): void; // logs the error and throws it
}

interface Version<T> {
  newVersion: T; // unmarshalled javascript object of new image (if exists) or null
  oldVersion: T; // unmarshalled javascript object of old image (if exists) or null
  keys: any; // unmarshalled javascript object of keys (includes key values)
  tableName: string; // name of the table the object came from
  tableArn: string; // arn of the table the object came from
  eventName: 'INSERT' | 'MODIFY' | 'REMOVE'; // name of the event (INSERT || MODIFY || REMOVE)
}
```

# Lambda Authorizer

## Sample TypeScript implementation

```ts
import { authorizer } from '@manwaring/lambda-wrapper';
const verifier = new Verifier(); // setup and configure JWT validation library

export const handler = authorizer(async ({ token, valid, invalid }) => {
  try {
    if (!token) {
      return invalid('Missing token');
    }
    const jwt = await verifier.verifyAccessToken(token);
    return valid(jwt);
  } catch (err) {
    return invalid(err);
  }
});
```

## Properties and methods available on wrapper signature

```ts
interface AuthorizerSignature {
  event: CustomAuthorizerEvent; // original event
  token: string; // authorizer token from original event
  valid(jwt: any): Policy; // returns AWS policy to authenticate request, and adds auth context if available
  invalid(message?: any): void; // records invalid information and throws 401 unauthorized
  error(error?: any): void; // records error information and throws 401 unauthorized
}

interface Policy {
  principalId: string;
  policyDocument: {
    Version: string;
    Statement: {
      Action: string;
      Effect: string;
      Resource: string;
    }[];
  };
}
```

# SNS

## Sample TypeScript implementation

```ts
import { sns } from '@manwaring/lambda-wrapper';
import { CustomInterface } from './custom-interface';

// By passing in CustomInterface as a generic the async method signature will correctly identify newVersions as an array of CustomInterface, making TypeScript development easier (note that the generic is not required in JavaScript projects)
export const handler = sns<CustomInterface>(async ({ message, success, error }) => {
  try {
    console.log(message);
    return success();
  } catch (err) {
    return error(err);
  }
});
```

## Properties and methods available on wrapper signature

```ts
interface SnsSignature {
  event: SNSEvent; // original event
  message: any; // JSON-parsed message from event
  success(message?: any): any; // logs and returns the message
  error(error?: any): void; // logs the error and throws
}
```

# Generic event

## Sample TypeScript implementation

```ts
import { wrapper } from '@manwaring/lambda-wrapper';
import { CustomInterface } from './custom-interface';

// By passing in CustomInterface as a generic the async method signature will correctly identify newVersions as an array of CustomInterface, making TypeScript development easier (note that the generic is not required in JavaScript projects)
export const handler = wrapper<CustomInterface>(async ({ event, success, error }) => {
  try {
    const { value1, value2 } = event;
    const results = await doSomething(value1, value2);
    return success(results);
  } catch (err) {
    return error(err);
  }
});
```

## Properties and methods available on wrapper signature

```ts
interface WrapperSignature<T> {
  event: T; // original event
  success(message?: any): any; // logs and returns the message
  error(error?: any): void; // logs the error and throws
}
```

# Example projects

There is one [working example](examples) of how this package can be used in a simple 'hello world' serverless application:

1. [Using the Serverless Framework and TypeScript](examples/ts)
