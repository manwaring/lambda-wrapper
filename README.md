<p align="center">
  <img height="150" src="https://avatars0.githubusercontent.com/u/36457275?s=400&u=16d355f384ed7f8e0655b7ed1d70ff2e411690d8&v=4e">
  <img height="150" src="https://user-images.githubusercontent.com/2955468/44874383-0168f780-ac69-11e8-8e51-774678cbd966.png">
</p>

[![NPM version][latest-version-badge]][latest-version-badge-url][![Total downloads][total-downloads-badge]][total-downloads-badge-url][![License][license-badge]][license-badge-url]

[![Build status][build-badge]][build-badge-url][![Known Vulnerabilities][vulnerability-badge]][vulnerability-badge-url][![Dependency Status][dependency-badge]][dependency-badge-url][![devDependency Status][dev-dependency-badge]][dev-dependency-badge-url][![Code style][formatter-badge]][formatter-badge-url]

# AWS Lambda wrapper library

1. [Package overview](#package-overview)
1. [Installation and setup](#installation-and-setup)
1. [Supported AWS trigger events](#supported-aws-lambda-trigger-events)
1. [Example usage](#example-usage)
   - [API Gateway event wrapper](#api-event-wrapper)
   - [API Gateway authorizer event wrapper](#auth-event-wrapper)
   - [CloudFormation Custom Resource event wrapper](#cloudformation-custom-resource-event-wrapper)
   - [SNS event wrapper](#sns-event-wrapper)
   - [DynamoDB Stream event wrapper](#dynamodb-stream-event-wrapper)
   - [Generic event wrapper](#general-event-wrapper)
1. [Epsagon labels](#epsagon-labels)

## Package overview

This package provides custom Lambda function wrappers to help simplify Lambda application code and to provide default implementations for logging invocation and status information. For information about optional setup information see the [setup section below](#installation-and-setup).

This project supports integrations with both [Epsagon](https://epsagon.com) and [IOPipe](https://iopipe.com) for (IMO) the best serverless logging and monitoring experiences available at the moment. Each wrapper will automatically label the invocations and add appropriate metrics upon receipt of the event payload as well as when helper callback functions are invoked. For more information about what labels, metrics, and logs are configured for each wrapper please see the [Epsagon and IOPipe section below](#epsagon-iopipe).

## Installation and setup

`npm i --save @manwaring/lambda-wrapper`

If you want to take advantage of either Epsagon or IOPipe logging and monitoring functionality (highly recommmended!) you'll need to create an account with them and setup your project appropriately. If this library detects either of the other two as being present in your application it will automatically apply standard tagging (Epsagon labels and IOPipe labels and metrics) to each invocation for easier logging, monitoring, and troubleshooting.

Optional Epsagon setup:

1. More information on setting up Epsagon in your application can be found in the [Epsagon configuration documentation here](https://github.com/epsagon/epsagon-node).
1. If you want Epsagon to add a label for the stage the Lambda function is deployed to will need to set a `STAGE` environment variable
1. If you want Epsagon to add a label for the git revision of the deployed Lambda code you will need to set a `REVISION` environment variable (see [git-rev-sync](https://www.npmjs.com/package/git-rev-sync) for a JavaScript library that can help with this, and [serverless-plugin-git-variables](https://www.npmjs.com/package/serverless-plugin-git-variables) for a Serverless Framework plugin)

Optional IOPipe setup:

1. More information on setting up IOPipe in your application can be found in the [IOPipe configuration documentation here](https://github.com/iopipe/iopipe-js-core#configuration).
1. If you want IOPipe to add a metric for the stage the Lambda function is deployed to will need to set a `STAGE` environment variable
1. If you want IOPipe to add a metric for the git revision of the deployed Lambda code you will need to set a `REVISION` environment variable (see [git-rev-sync](https://www.npmjs.com/package/git-rev-sync) for a JavaScript library that can help with this, and [serverless-plugin-git-variables](https://www.npmjs.com/package/serverless-plugin-git-variables) for a Serverless Framework plugin)

## Supported AWS Lambda trigger events

All of the below wrappers provide a deconstructed method signature exposing parsed/unmarshalled request parameters and helper methods.

1. [API Gateway event wrapper](#api-event-wrapper) with support for cors headers and 200, 302, 400, and 500 responses
1. [API Gateway authorizer event wrapper](#auth-event-wrapper) with support for creating access policies for successfully authorized requests
1. [CloudFormation Custom Resource event wrapper](#cloudformation-custom-resource-event-wrapper) with support for CloudFormation successes and failures
1. [SNS event wrapper](#sns-event-wrapper) with support for success and failure responses
1. [DynamoDB Stream event wrapper](#dynamodb-stream-event-wrapper) with support for success and failure responses
1. A [generic event wrapper](#general-event-wrapper) with support for success and failure responses.

# Example usage

## Api event wrapper

### Available properties and methods on api wrapper signature:

```ts
interface ApiSignature {
  event: APIGatewayEvent; // original event
  body: any; // JSON parsed body payload if exists (otherwise null)
  path: { [name: string]: string }; // path param payload as key-value pairs if exists (otherwise null)
  query: { [name: string]: string }; // query param payload as key-value pairs if exists (otherwise null)
  headers: { [name: string]: string }; // headers param payload as key-value pairs if exists (otherwise null)
  testRequest: boolean; // indicates if this is a test request - looks for a header matching process.env.TEST_REQUEST_HEADER (dynamic from application) or 'Test-Request' (default)
  auth: any; // auth context from custom authorizer if exists (otherwise null)
  success(payload?: any): void; // returns 200 status with payload
  invalid(errors?: string[]): void; // returns 400 status with errors in payload
  redirect(url: string): void; // returns 302 redirect with new url
  error(error?: any): void; // returns 500 status with error and original request payload
}
```

\*Note that each callback helper functions (success, invalid, redirect, error) includes CORS-enabling header information.

### Example implementation:

```ts
import { apiWrapper, ApiSignature } from '@manwaring/lambda-wrapper';
...

export const handler = apiWrapper(async ({ path, success, error }: ApiSignature) => {
  try {
    const { pathParam1, pathParam2 } = path;
    const results = await doSomething(pathParam1, pathParam2);
    success(results);
  } catch (err) {
    error(err);
  }
});
```

### Information captured with each invocation

**The following information is always included:**

1. (IOPipe metric) Body: parsed or null body object included with event
1. (IOPipe metric) Path: path parameters included with event
1. (IOPipe metric) Query: query string parameters included with event
1. (Debug log) Full request (body, path, query)

Depending on which callback helper is invoked additional information will be associated with the invocation:

**Success callback helper:**

1. (Epsagon label) `success`
1. (IOPipe label) `success`
1. (Info log) Response payload/body

**Invalid callback helper:**

1. (Epsagon label) `invalid`
1. (IOPipe label) `invalid`
1. (IOPipe metric) Invalid: list of validation messages
1. (Warn log) List of validation errors

**Redirect callback helper:**

1. (Epsagon label) `redirect`
1. (IOPipe label) `redirect`
1. (Info log) Redirect URL

**Error callback helper:**

1. (Epsagon label) `error`
1. (IOPipe label) `error`
1. (IOPipe metric) Error: error object or message
1. (Error log) Error object or message

## Auth event wrapper

### Available properties and methods on auth wrapper signature:

```ts
interface AuthorizerSignature {
  event: CustomAuthorizerEvent; // original event
  token: string; // authorizer token from original event
  valid(jwt: any): void; // creates AWS policy to authenticate request, and adds auth context if available
  invalid(message?: string[]): void; // returns 401 unauthorized
  error(error?: any): void; // records error information and returns 401 unauthorized
}
```

### Example implementation:

```ts
import { authWrapper, AuthorizerSignature } from '@manwaring/lambda-wrapper';
...

export const handler = authWrapper(async ({ token, valid, invalid }: AuthorizerSignature) => {
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

### Information captured with each invocation

Depending on which callback helper is invoked additional information will be associated with the invocation:

**Valid callback helper:**

1. (Epsagon label) `valid`
1. (IOPipe label) `valid`

**Invalid callback helper:**

1. (Epsagon label) `invalid`
1. (IOPipe label) `invalid`
1. (IOPipe metric) Invalid: the message indicating cause of invalidation (expired token, unauthorized, etc.)

**Error callback helper:**

1. (Epsagon label) `error`
1. (IOPipe label) `error`
1. (IOPipe metric) Error: error object or message

## CloudFormation custom resource event wrapper

### Available properties and methods on CloudFormation wrapper signature:

```ts
interface CloudFormationSignature {
  event: CloudFormationCustomResourceEvent; // original event
  success(payload?: any): void; // sends CloudFormation success event
  failure(message?: any): void; // sends CloudFormation failure event
}
```

### Example implementation:

// TODO CloudFormation wrapper implementation example

### Information captured with each invocation

Depending on which callback helper is invoked additional information will be associated with the invocation:

**Success callback helper:**

1. (Epsagon label) `success`
1. (IOPipe label) `success`
1. (Info log) Success message

**Failure callback helper:**

1. (Epsagon label) `failure`
1. (IOPipe label) `failure`
1. (Error log) Error message or object

## SNS event wrapper

### Available properties and methods on SNS wrapper signature:

```ts
interface SnsSignature {
  event: SNSEvent; // original event
  message: any; // JSON-parsed message from event
  success(payload?: any): void; // invokes lambda callback with success
  error(error?: any): void; // invokes lambda callback with error
}
```

### Example implementation:

// TODO SNS event wrapper implementation example

### Information captured with each invocation

Depending on which callback helper is invoked additional information will be associated with the invocation:

**Success callback helper:**

1. (Epsagon label) `success`
1. (IOPipe label) `success`
1. (Info log) Success message

**Error callback helper:**

1. (Epsagon label) `error`
1. (IOPipe label) `error`
1. (IOPipe metric) Error: Error message or object
1. (Error log) Error message or object

## DynamoDB stream event wrapper

### Available properties and methods on DynamoDB wrapper signature:

```ts
interface StreamSignature {
  event: DynamoDBStreams.GetRecordsOutput; // original event
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

### Example implementation:

// TODO DynamoDB stream wrapper implementation example

### Information captured with each invocation

Depending on which callback helper is invoked additional information will be associated with the invocation:

**Success callback helper:**

1. (Epsagon label) `success`
1. (IOPipe label) `success`
1. (Info log) Success message

**Error callback helper:**

1. (Epsagon label) `error`
1. (IOPipe label) `error`
1. (IOPipe metric) Error: Error message or object
1. (Error log) Error message or object

## General event wrapper

### Available properties and methods on general wrapper signature:

```ts
interface WrapperSignature {
  event: any; // original event
  success(payload?: any): void; // invokes lambda callback with success response
  error(error?: any): void; // invokes lambda callback with error response
}
```

### Example implementation:

```ts
import { wrapper, WrapperSignature } from '@manwaring/lambda-wrapper';
...

export const handler = wrapper(async ({ event, success, error }: WrapperSignature) => {
  try {
    // application logic using any kind of event information
    const { value1, value2 } = event;
    const results = await doSomething(value1, value2);
    success(results);
  } catch (err) {
    error(err);
  }
});
```

### Information captured with each invocation

Depending on which callback helper is invoked additional information will be associated with the invocation:

**Success callback helper:**

1. (Epsagon label) `success`
1. (IOPipe label) `success`
1. (Info log) Success message

**Error callback helper:**

1. (Epsagon label) `error`
1. (IOPipe label) `error`
1. (IOPipe metric) Error: Error message or object
1. (Error log) Error message or object

## Common labels and metrics

For each invocation across all wrapper types you'll get the following:

Labels:

1. Region: AWS region your Lambda is running in
1. Revision: Git revision of the deployed Lambda code (if you set a `REVISION` environment variable for your Lambda function)
1. Stage: Name of the stage this Lambda function is deployed with (if you set a `STAGE` environment variable for your Lambda function)
1. The result of each invocation, determined by the helper callback function that was invoked (`success`, `invalid`, `errors`, etc. - see the per-wrapper details above for more information)

[build-badge]: https://circleci.com/gh/manwaring/lambda-wrapper.svg?style=shield&circle-token=29c46c698a84144d4ea9d21552f1927c87afd68e
[build-badge-url]: https://circleci.com/gh/manwaring/lambda-wrapper
[dependency-badge]: https://david-dm.org/manwaring/lambda-wrapper.svg
[dependency-badge-url]: https://david-dm.org/manwaring/lambda-wrapper
[dev-dependency-badge]: https://david-dm.org/manwaring/lambda-wrapper/dev-status.svg
[dev-dependency-badge-url]: https://david-dm.org/manwaring/lambda-wrapper?type=dev
[formatter-badge]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[formatter-badge-url]: #badge
[license-badge]: https://img.shields.io/npm/l/@manwaring/lambda-wrapper.svg
[license-badge-url]: https://www.npmjs.com/package/@manwaring/lambda-wrapper
[vulnerability-badge]: https://api.dependabot.com/badges/status?host=github&repo=manwaring/lambda-wrapper
[vulnerability-badge-url]: https://dependabot.com/
[latest-version-badge]: https://img.shields.io/npm/v/%40manwaring%2Flambda-wrapper/latest.svg
[latest-version-badge-url]: https://npmjs.com/package/@manwaring/lambda-wrapper
[total-downloads-badge]: https://img.shields.io/npm/dt/@manwaring/lambda-wrapper.svg
[total-downloads-badge-url]: https://www.npmjs.com/package/@manwaring/lambda-wrapper
