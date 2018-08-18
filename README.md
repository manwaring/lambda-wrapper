<p align="center">
  <img height="150" src="https://avatars0.githubusercontent.com/u/36457275?s=400&u=16d355f384ed7f8e0655b7ed1d70ff2e411690d8&v=4e">
  <img height="150" src="https://user-images.githubusercontent.com/2955468/44294632-338d5900-a268-11e8-82fc-88e1173bba69.png">
</p>

[![Build status][build-badge]][build-badge-url]
[![Known Vulnerabilities][vulnerability-badge]][vulnerability-badge-url]
[![Dependency Status][dependency-badge]][dependency-badge-url]
[![devDependency Status][dev-dependency-badge]][dev-dependency-badge-url]
[![NPM version][latest-version-badge]][latest-version-badge-url]
[![License][license-badge]][license-badge-url]
[![Code style][formatter-badge]][formatter-badge-url]

# AWS Lambda wrapper library

This package provides custom Lambda function wrappers to help simplify Lambda application code and to provide default implementations for logging invocation and status information.

## Supported AWS Lambda trigger events

All of the below wrappers provide a deconstructed method signature exposing parsed/unmarshalled request parameters and helper methods.

1. API Gateway event with support for cors headers and 200, 302, 400, and 500 responses
1. API Gateway authorizer event with support for creating access policies for successfully authorized requests
1. CloudFormation Custom Resource event with support for CloudFormation successes and failures
1. SNS event with support for success and failure responses
1. DynamoDB Stream event with support for success and failure responses
1. A generic event wrapper with support for success and failure responses.

# Example usage

## Api event wrapper

Available properties and methods on api wrapper signature:

```ts
interface ApiSignature {
  event: APIGatewayEvent; // original event
  body: any; // JSON parsed body payload if exists (otherwise null)
  path: { [name: string]: string }; // path param payload as key-value pairs if exists (otherwise null)
  query: { [name: string]: string }; // query param payload as key-value pairs if exists (otherwise null)
  auth: any; // auth context from custom authorizer if exists (otherwise null)
  success(payload: any): void; // returns 200 status with payload
  invalid(errors: string[]): void; // returns 400 status with errors in payload
  redirect(url: string): void; // returns 302 redirect with new url
  error(error: any): void; // returns 500 status with error and original request payload
}
```

Example implementation:

```ts
import { apiWrapper, ApiSignature } from '@manwaring/lambda-wrapper';

export const handler = apiWrapper(async ({ path, success, error }: ApiSignature) => {
  try {
    // application logic using API event information
    const { pathParam1, pathParam2 } = path;
    const results = await doSomething(pathParam1, pathParam2);
    success(results);
  } catch (err) {
    return error(err);
  }
});
```

## Auth event wrapper

Available properties and methods on auth wrapper signature:

```ts
interface AuthorizerSignature {
  event: CustomAuthorizerEvent; // original event
  token: string; // authorizer token from original event
  valid(jwt: any): void; // creates AWS policy to authenticate request, and adds auth context if available
  invalid(message: string[]): void; // returns 401 unauthorized
  error(error: any): void; // records error information and returns 401 unauthorized
}
```

Example implementation:

```ts
import { authWrapper, AuthorizerSignature } from '@manwaring/lambda-wrapper';

export const handler = authWrapper(async ({ token, valid, invalid }: AuthorizerSignature) => {
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

## General event wrapper

Available properties and methods on general wrapper signature:

```ts
interface WrapperSignature {
  event: any; // original event
  success(payload: any): void; // invokes lambda callback with success response
  error(error: any): void; // invokes lambda callback with error response
}
```

Example implementation:

```ts
import { wrapper, WrapperSignature } from '@manwaring/lambda-wrapper';

export const handler = wrapper(async ({ event, success, error }: WrapperSignature) => {
  try {
    // application logic using any kind of event information
    const { value1, value2 } = event;
    const results = await doSomething(value1, value2);
    success(results);
    return success(response);
  } catch (err) {
    return error(err);
  }
});
```

## CloudFormation custom resource event wrapper

Available properties and methods on CloudFormation wrapper signature:

```ts
interface CloudFormationSignature {
  event: CloudFormationCustomResourceEvent; // original event
  success(payload: any): void; // sends CloudFormation success event
  failure(message: any): void; // sends CloudFormation failure event
}
```

Example implementation:

// TODO CloudFormation wrapper implementation example

## SNS event wrapper

Available properties and methods on SNS wrapper signature:

```ts
interface SnsSignature {
  event: SNSEvent; // original event
  message: any; // JSON-parsed message from event
  success(payload: any): void; // invokes lambda callback with success
  error(error: any): void; // invokes lambda callback with error
}
```

Example implementation:

// TODO SNS event wrapper implementation example

## DynamoDB stream event wrapper

Available properties and methods on DynamoDB wrapper signature:

```ts
interface StreamSignature {
  event: DynamoDBStreams.GetRecordsOutput; // original event
  newVersions: any[]; // array of all unmarshalled javascript objects of new images
  oldVersions: any[]; // array of all unmarshalled javascript objects of old images
  versions: Version[]; // array of full version object (new image, old image, etc - see Version interface)
  success(message: any): void; // invokes lambda callback with success
  error(error: any): void; // invokes lambda callback with error
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

Example implementation:

// TODO DynamoDB stream wrapper implementation example

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
[vulnerability-badge]: https://snyk.io/test/github/manwaring/lambda-wrapper/badge.svg?targetFile=package.json
[vulnerability-badge-url]: https://snyk.io/test/github/manwaring/lambda-wrapper?targetFile=package.json
[latest-version-badge]: https://img.shields.io/npm/v/%40manwaring%2Flambda-wrapper/latest.svg
[latest-version-badge-url]: https://npmjs.com/package/@manwaring/lambda-wrapper
