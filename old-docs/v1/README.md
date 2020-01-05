<p align="center">
  <img height="150" src="https://avatars0.githubusercontent.com/u/36457275?s=400&u=16d355f384ed7f8e0655b7ed1d70ff2e411690d8&v=4e">
  <img height="150" src="https://user-images.githubusercontent.com/2955468/44874383-0168f780-ac69-11e8-8e51-774678cbd966.png">
</p>

# AWS Lambda wrapper library

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

AWS Lambda supports a wide variety of event triggers, each with unique payloads and expected responses. The Lambda execution environment, however, only provides the raw events and has no included mechanisms for simplifying response object creation. For example, API Gateway events include only the raw request body, leaving it up to developers to implement parsing themselves. Similarly, the developer is responsible for creating a response object which includes the correct HTTP Status Code and headers. Given the standard nature of these kinds of concerns, this library exposes helpful abstractions like parsed HTTP bodies based on content-type headers, and success response functions which apply correct status codes and headers before invoking the Lambda callback.

# Installation and setup

Install and save the package to `package.json` as a dependency:

`npm i --save @manwaring/lambda-wrapper`

`yarn add @manwaring/lambda-wrapper`

## Optional configuration

If you want the wrapper to log request and response messages (helpful for debugging set an environemnt variable for `LAMBDA_WRAPPER_LOG=true`.

If you want each invocation to be tagged with the AWS region, environment/, and Git revision simply set environment variables for each: `REGION=us-east-1`, `STAGE=prod`, `REVISION=f4ba682` (see [git-rev-sync](https://www.npmjs.com/package/git-rev-sync) and [serverless-plugin-git-variables](https://www.npmjs.com/package/serverless-plugin-git-variables) for libraries that can help you set git revision)

If you want to take advantage of either [Epsagon](https://epsagon.com/) or [IOPipe](https://www.iopipe.com/) for advanced serverless instrumentation (highly recommmended!) you'll need to create an account with them and follow their instructions for setting up your project. If this library detects either of those packages it will automatically apply standard tagging (Epsagon labels and IOPipe labels and metrics) to each invocation for easier logging, monitoring, and troubleshooting.

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
    success(results);
  } catch (err) {
    error(err);
  }
});
```

### Properties and methods available on wrapper signature

```ts
interface ApiSignature {
  event: APIGatewayEvent; // original event
  body: any; // JSON or form parsed body payload if exists (based on content-type headers), otherwise the raw body object
  path: { [name: string]: string }; // path param payload as key-value pairs
  query: { [name: string]: string }; // query param payload as key-value pairs
  headers: { [name: string]: string }; // headers param payload as key-value pairs
  testRequest: boolean; // indicates if this is a test request, based on presence of headers matching 'Test-Request' or process.env.TEST_REQUEST_HEADER
  auth: any; // auth context from custom authorizer
  success(payload?: any, replacer?: (this: any, key: string, value: any) => any): void; // returns 200 status with payload
  invalid(errors?: string[]): void; // returns 400 status with errors
  redirect(url: string): void; // returns 302 redirect with new url
  error(error?: any): void; // returns 500 status with error
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
    success();
  } catch (err) {
    failure(err);
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

export const handler = dynamodbStream(async ({ newVersions, success, error }) => {
  try {
    newVersions.forEach(version => console.log(version));
    return success(newVersions);
  } catch (err) {
    return error(err);
  }
});
```

### Properties and methods available on wrapper signature

```ts
interface DynamoDBStreamSignature {
  event: DynamoDBStreamEvent; // original event
  newVersions: any[]; // array of all unmarshalled javascript objects of new images
  oldVersions: any[]; // array of all unmarshalled javascript objects of old images
  versions: Version[]; // array of full version object (new image, old image, etc - see Version interface)
  success(message?: any): void; // invokes lambda callback with success
  error(error?: any): void; // invokes lambda callback with error
}

interface Version {
  newVersion: any; // unmarshalled javascript object of new image (if exists) or null
  oldVersion: any; // unmarshalled javascript object of old image (if exists) or null
  keys: any; // unmarshalled javascript object of keys (includes key values)
  tableName: string; // name of the table the object came from
  tableArn: string; // arn of the table the object came from
  eventName: string; // name of the event (INSERT || MODIFY || REMOVE)
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
    valid(jwt);
  } catch (err) {
    invalid(err);
  }
});
```

### Properties and methods available on wrapper signature

```ts
interface AuthorizerSignature {
  event: CustomAuthorizerEvent; // original event
  token: string; // authorizer token from original event
  valid(jwt: any): void; // creates AWS policy to authenticate request, and adds auth context if available
  invalid(message?: string[]): void; // returns 401 unauthorized
  error(error?: any): void; // records error information and returns 401 unauthorized
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
  message: any; // JSON-parsed message from event (or raw message if not JSON)
  success(payload?: any): void; // invokes lambda callback with success
  error(error?: any): void; // invokes lambda callback with error
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
    success(results);
  } catch (err) {
    error(err);
  }
});
```

### Properties and methods available on wrapper signature

```ts
interface WrapperSignature {
  event: any; // original event
  success(payload?: any): void; // invokes lambda callback with success response
  error(error?: any): void; // invokes lambda callback with error response
}
```

# Example projects

THere is one [working example](examples) of how this package can be used in a simple 'hello world' serverless application:

1. [Using the Serverless Framework and TypeScript](examples/ts)
