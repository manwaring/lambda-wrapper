<p align="center">
  <img height="140" src="https://avatars0.githubusercontent.com/u/36457275?s=400&u=16d355f384ed7f8e0655b7ed1d70ff2e411690d8&v=4e">
  <img height="140" src="https://user-images.githubusercontent.com/2955468/44874383-0168f780-ac69-11e8-8e51-774678cbd966.png">
</p>

<p align="center">
  <a href="https://npmjs.com/package/@manwaring/lambda-wrapper">
    <img src="https://flat.badgen.net/npm/v/@manwaring/lambda-wrapper?icon=npm&label=npm@latest"></a>
  <a href="https://www.npmjs.com/package/@manwaring/lambda-wrapper">
    <img src="https://flat.badgen.net/npm/dt/@manwaring/lambda-wrapper?icon=npm"></a>
  <a href="https://codecov.io/gh/manwaring/lambda-wrapper">
    <img src="https://flat.badgen.net/codecov/c/github/manwaring/lambda-wrapper/?icon=codecov"></a>
  <a href="https://packagephobia.now.sh/result?p=@manwaring/lambda-wrapper">
    <img src="https://flat.badgen.net/packagephobia/install/@manwaring/lambda-wrapper"></a>
  <a href="https://www.npmjs.com/package/@manwaring/lambda-wrapper">
    <img src="https://flat.badgen.net/npm/license/@manwaring/lambda-wrapper"></a>
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

### This documentation is for v3 of the library - [go here for v1](old-docs/v1/README.md) and [here for v2](old-docs/v2/README.md)

1. [Overview](#overview)
1. [Installation and setup](#installation-and-setup)
   - [Optional configuration](#optional-configuration)
1. [Supported events](#supported-events)
   - [API Gateway](#api-gateway)
   - [CloudFormation Custom Resource](#cloudformation-custom-resource)
   - [DynamoDB Stream](#dynamodb-stream)
   - [Lambda Authorizer](#lambda-authorizer)
   - [SNS](#sns)
   - [Generic event](#generic-event)
1. [Example projects](#example-projects)

_Feedback appreciated! If you have an idea for how this library can be improved [please open an issue](https://github.com/manwaring/lambda-wrapper/issues/new)._

# Overview

### TL;DR

This library provides custom Lambda function wrappers which expose standard, abstracted functionality so that developers can focus on writing business logic instead of parsing event payloads and crafting response objects.

### Rationale and motivation

AWS Lambda supports a wide variety of event triggers, each with unique payloads and expected responses. The Lambda execution environment, however, only provides the raw events and has no included mechanisms for simplifying response object creation. For example, API Gateway events include only the raw request body, leaving it up to developers to implement parsing themselves. Similarly, the developer is responsible for creating a response object which includes the correct HTTP status code and headers. Given the standard nature of these kinds of concerns, this library exposes helpful abstractions like parsed HTTP bodies based on content-type headers, and success response functions which create response objects with the correct status codes and headers for returning.

# Installation and setup

Install and save the package to `package.json` as a dependency:

`npm i --save @manwaring/lambda-wrapper`

`yarn add @manwaring/lambda-wrapper`

## Optional configuration

If you want the wrapper to log request and response messages (helpful for debugging set an environemnt variable for `LAMBDA_WRAPPER_LOG=true`.

If you want each invocation to be tagged with the AWS region, environment/, and Git revision simply set environment variables for each: `REGION=us-east-1`, `STAGE=prod`, `REVISION=f4ba682` (see [git-rev-sync](https://www.npmjs.com/package/git-rev-sync) and [serverless-plugin-git-variables](https://www.npmjs.com/package/serverless-plugin-git-variables) for libraries that can help you set git revision)

# Supported events

All of the events bellow have a corresponding wrapper which provides a deconstructed method signature exposing parsed/unmarshalled request parameters and helper response methods.

1. [API Gateway](#api-gateway) with support for cors headers and 200, 302, 400, and 500 responses
1. [CloudFormation Custom Resource](#cloudformation-custom-resource) with support for CloudFormation successes and failures
1. [DynamoDB Stream](#dynamodb-stream) with support for success and failure responses
1. [Lambda Authorizer](#lambda-authorizer) with support for creating access policies for successfully authorized requests
1. [SNS](#sns) with support for success and failure responses
1. [Generic event](#generic-event) wrapper with support for success and failure responses

## API Gateway

### Sample implementation

```ts
import { api } from '@manwaring/lambda-wrapper';

export const handler = api(async ({ body, path, success, error }) => {
  try {
    const { pathParam1, pathParam2 } = path;
    const results = await doSomething(body, pathParam1, pathParam2);
    return success(results);
  } catch (err) {
    return error(err);
  }
});
```

### Properties and methods available on wrapper signature

```ts
export interface ApiSignature {
  event: APIGatewayEvent; // original event
  body: any; // JSON parsed body payload if exists (otherwise null)
  path: { [name: string]: string }; // path param payload as key-value pairs if exists (otherwise null)
  query: { [name: string]: string }; // query param payload as key-value pairs if exists (otherwise null)
  headers: { [name: string]: string }; // header payload as key-value pairs if exists (otherwise null)
  testRequest: boolean; // indicates if this is a test request - looks for a header matching process.env.TEST_REQUEST_HEADER (dynamic from application) or 'Test-Request' (default)
  auth: any; // auth context from custom authorizer if exists (otherwise null)
  success(payload?: any, replacer?: (this: any, key: string, value: any) => any): ApiResponse; // returns 200 status code with optional payload as body
  invalid(errors?: string[]): ApiResponse; // returns 400 status code with optional errors as body
  notFound(message?: string): ApiResponse; // returns 404 status code with optional message as body
  notAuthorized(message?: string): ApiResponse; // returns 403 status code with optional message as body
  redirect(url: string): ApiResponse; // returns 302 status code (redirect) with new url
  error(error?: any): ApiResponse; // returns 500 status code with optional error as body
}

interface ApiResponse {
  statusCode: number;
  headers: { [name: string]: string | boolean };
  body?: string;
}
```

\*Note that each callback helper functions (success, invalid, redirect, error) includes CORS-enabling header information

## CloudFormation Custom Resource

### Sample implementation

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

### Properties and methods available on wrapper signature

```ts
interface CloudFormationSignature {
  event: CloudFormationCustomResourceEvent; // original event
  success(payload?: any): void; // sends CloudFormation success event
  failure(message?: any): void; // sends CloudFormation failure event
}
```

## DynamoDB Stream

### Sample implementation

```ts
import { dynamodbStream } from '@manwaring/lambda-wrapper';

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

### Properties and methods available on wrapper signature

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

## Lambda Authorizer

### Sample implementation

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

### Properties and methods available on wrapper signature

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

## SNS

### Sample implementation

```ts
import { sns } from '@manwaring/lambda-wrapper';

export const handler = sns(async ({ message, success, error }) => {
  try {
    console.log(message);
    return success();
  } catch (err) {
    return error(err);
  }
});
```

### Properties and methods available on wrapper signature

```ts
interface SnsSignature {
  event: SNSEvent; // original event
  message: any; // JSON-parsed message from event
  success(message?: any): any; // logs and returns the message
  error(error?: any): void; // logs the error and throws
}
```

## Generic event

### Sample implementation

```ts
import { wrapper } from '@manwaring/lambda-wrapper';

export const handler = wrapper(async ({ event, success, error }) => {
  try {
    const { value1, value2 } = event;
    const results = await doSomething(value1, value2);
    return success(results);
  } catch (err) {
    return error(err);
  }
});
```

### Properties and methods available on wrapper signature

```ts
interface WrapperSignature {
  event: any; // original event
  success(message?: any): any; // logs and returns the message
  error(error?: any): void; // logs the error and throws
}
```

# Example projects

There is one [working example](examples) of how this package can be used in a simple 'hello world' serverless application:

1. [Using the Serverless Framework and TypeScript](examples/ts)
