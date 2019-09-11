# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html)

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
