# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html)

## [3.4.0]&nbsp;&nbsp;(2020-05-10)

### Added

- Added support for API Gateway v2 HTTP API Auth property

## [3.3.3]&nbsp;&nbsp;(2020-05-08)

### Changed

- Change npmignore config to whitelisting

## [3.3.2]&nbsp;&nbsp;(2020-05-07)

### Changed

- Make generics optional by defaulting to any

## [3.3.1]&nbsp;&nbsp;(2020-05-07)

### Changed

- Update dependencies

## [3.3.0]&nbsp;&nbsp;(2020-05-07)

### Changed

- Update API, SNS, and generic wrappers with support for generic types

## [3.2.0]&nbsp;&nbsp;(2020-05-02)

### Changed

- DynamoDB stream wrapper accepts optional type generic for better TypeScript support
- DynamoDB stream wrapper returns string enum for DynamoDB event type instead of 'string'

## [3.1.3]&nbsp;&nbsp;(2020-03-16)

### Changed

- Updated out of date libraries

## [3.1.2]&nbsp;&nbsp;(2020-02-11)

### Fixed

- Support additional properties on content-type
- Add correct content-type header for JSON stringified API responses
- Update old libraries

## [3.1.1]&nbsp;&nbsp;(2020-01-22)

### Added

- Add a 'not authorized' response handler to the api wrapper

## [3.1.0]&nbsp;&nbsp;(2020-01-20)

### Changed

- Default signature params to undefined instead of null to allow for default values
- Updated libraries

## [3.0.0]&nbsp;&nbsp;(2020-01-05)

### Changed

- Api error response generates a 500 status code instead of 503

## [2.1.1]&nbsp;&nbsp;(2020-01-05)

### Added

- Api error response logs Error message if passed an Error object

## [2.1.0]&nbsp;&nbsp;(2020-01-04)

### Changed

- Api error response includes Error message if passed an Error object

### Fixed

- Removed extra files from published package
- Correct package.json entry point to lib

## [2.0.1]&nbsp;&nbsp;(2020-01-04)

### Fixed

- Removed extra files from published package
- Correct package.json entry point to lib

## [2.0.0]&nbsp;&nbsp;(2020-01-04)

### Changed

- Removed references to Epsagon and IOPipe
- Instead of callbacks, response methods use the recommended return syntax

### Added

- V2 of the docs

## [1.2.2]&nbsp;&nbsp;(2019-10-14)

### Changed

- Modified console out logging level when serverless-specific framework libraries are not found

## [1.2.1]&nbsp;&nbsp;(2019-10-06)

### Fixed

- Added correct type definitions for new API success response method

## [1.2.0]&nbsp;&nbsp;(2019-10-06)

### Added

- Support for JSON.stringify replacer in the API success response method

## [1.1.4]&nbsp;&nbsp;(2019-09-10)

### Added

- Added missing wrapper documentation

## [1.1.3]&nbsp;&nbsp;(2019-09-10)

### Changed

- Reverted CloudFormation Custom Resource responder library - realized that issue was with async function instead of lib

## [1.1.2]&nbsp;&nbsp;(2019-09-09)

### Changed

- Updated CloudFormation Custom Resource responder library

## [1.1.1]&nbsp;&nbsp;(2019-09-08)

### Changed

- Updated CloudFormation Custom Resource responder library

## [1.1.0]&nbsp;&nbsp;(2019-09-08)

### Changed

- Switch to a new CloudFormation Custom Resource responder library

## [1.0.10]&nbsp;&nbsp;(2019-09-08)

### Added

- Example projects using the latest version of the library

### Changed

- Clean up documentation

## [1.0.9]&nbsp;&nbsp;(2019-09-07)

### Changed

- Eliminate duplicative logging from response functions

## [1.0.8]&nbsp;&nbsp;(2019-09-07)

### Changed

- Update the remaining wrapper signature with Lambda inputs (event, context, callback) for easier testing in applications

## [1.0.7]&nbsp;&nbsp;(2019-09-07)

### Changed

- Update the api wrapper signature for easier testing in applications

## [1.0.1]&nbsp;&nbsp;(2019-09-04)

### Fixed

- Update authorizer wrapper invalid response with correct signature

## [1.0.0]&nbsp;&nbsp;(2019-09-04)

### Added

- Examples with tests to run after publishing a new version

### Changed

- Extensive refactor to support unit tests
- Update documentation to be more clear and concise

## 0.3.9&nbsp;&nbsp;(2019-09-01)

### Added

- This CHANGELOG to track project changes over time

### Changed

- Update older libraries
- Now publish from Git tags instead of master pushes

[3.4.0]: https://github.com/manwaring/lambda-wrapper/compare/v3.3.3...v3.4.0
[3.3.3]: https://github.com/manwaring/lambda-wrapper/compare/v3.3.1...v3.3.3
[3.3.2]: https://github.com/manwaring/lambda-wrapper/compare/v3.3.1...v3.3.2
[3.3.1]: https://github.com/manwaring/lambda-wrapper/compare/v3.3.0...v3.3.1
[3.3.0]: https://github.com/manwaring/lambda-wrapper/compare/v3.2.0...v3.3.0
[3.2.0]: https://github.com/manwaring/lambda-wrapper/compare/v3.1.3...v3.2.0
[3.1.3]: https://github.com/manwaring/lambda-wrapper/compare/v3.1.2...v3.1.3
[3.1.2]: https://github.com/manwaring/lambda-wrapper/compare/v3.1.1...v3.1.2
[3.1.1]: https://github.com/manwaring/lambda-wrapper/compare/v3.1.0...v3.1.1
[3.1.0]: https://github.com/manwaring/lambda-wrapper/compare/v3.0.0...v3.1.0
[3.0.0]: https://github.com/manwaring/lambda-wrapper/compare/v2.1.1...v3.0.0
[2.1.1]: https://github.com/manwaring/lambda-wrapper/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/manwaring/lambda-wrapper/compare/v2.0.1...v2.1.0
[2.0.1]: https://github.com/manwaring/lambda-wrapper/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/manwaring/lambda-wrapper/compare/v1.2.2...v2.0.0
[1.2.2]: https://github.com/manwaring/lambda-wrapper/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/manwaring/lambda-wrapper/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/manwaring/lambda-wrapper/compare/v1.1.4...v1.2.0
[1.1.4]: https://github.com/manwaring/lambda-wrapper/compare/v1.1.3...v1.1.4
[1.1.3]: https://github.com/manwaring/lambda-wrapper/compare/v1.1.2...v1.1.3
[1.1.2]: https://github.com/manwaring/lambda-wrapper/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/manwaring/lambda-wrapper/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/manwaring/lambda-wrapper/compare/v1.0.10...v1.1.0
[1.0.10]: https://github.com/manwaring/lambda-wrapper/compare/v1.0.9...v1.0.10
[1.0.9]: https://github.com/manwaring/lambda-wrapper/compare/v1.0.8...v1.0.9
[1.0.8]: https://github.com/manwaring/lambda-wrapper/compare/v1.0.7...v1.0.8
[1.0.7]: https://github.com/manwaring/lambda-wrapper/compare/v1.0.1...v1.0.7
[1.0.1]: https://github.com/manwaring/lambda-wrapper/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/manwaring/lambda-wrapper/compare/v0.3.8...v1.0.0
