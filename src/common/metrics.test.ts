import { Metrics } from './metrics';

describe('Metrics tagging', () => {
  const ORIGINAL_ENVS = process.env;
  const commonProps = { REVISION: 'ahf6e', STAGE: 'prod', AWS_REGION: 'us-east-1', LAMBDA_WRAPPER_LOG: 'true' };
  const payload = { hello: 'world' };
  const response = { goodbye: 'world' };
  const type = 'Test';
  const metrics = new Metrics(type);

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENVS, ...commonProps };
    console.debug = jest.fn();
    console.log = jest.fn();
  });

  it('Tags common', () => {
    metrics.common(payload);
    expect(console.debug).toHaveBeenCalledWith(`Received ${type} event payload`, payload);
    expect(console.log).toHaveBeenCalledWith('revision', commonProps.REVISION);
    expect(console.log).toHaveBeenCalledWith('stage', commonProps.STAGE);
    expect(console.log).toHaveBeenCalledWith('region', commonProps.AWS_REGION);
    expect(console.log).toHaveBeenCalledWith('payload', payload);
  });

  it('Tags success', () => {
    metrics.success(response);
    expect(console.debug).toHaveBeenCalledWith(`Successfully processed ${type} event, responding with`, response);
    expect(console.log).toHaveBeenCalledWith('success', response);
  });

  it('Tags valid', () => {
    metrics.valid(response);
    expect(console.debug).toHaveBeenCalledWith(`Valid ${type} event, responding with`, response);
    expect(console.log).toHaveBeenCalledWith('valid', response);
  });

  it('Tags invalid', () => {
    metrics.invalid(response);
    expect(console.debug).toHaveBeenCalledWith(`Invalid ${type} event, responding with`, response);
    expect(console.log).toHaveBeenCalledWith('invalid', response);
  });

  it('Tags redirect', () => {
    metrics.redirect(response);
    expect(console.debug).toHaveBeenCalledWith(`Redirecting ${type} event, responding with`, response);
    expect(console.log).toHaveBeenCalledWith('redirect', response);
  });

  it('Tags error', () => {
    metrics.error(response);
    expect(console.debug).toHaveBeenCalledWith(`Error processing ${type} event, responding with`, response);
    expect(console.log).toHaveBeenCalledWith('error', response);
  });

  it('Tags failure', () => {
    metrics.failure(response);
    expect(console.debug).toHaveBeenCalledWith(`Failure processing ${type} event, responding with`, response);
    expect(console.log).toHaveBeenCalledWith('failure', response);
  });
});

describe('Metrics tagging with missing libs', () => {
  const ORIGINAL_ENVS = process.env;
  const commonProps = { REVISION: 'ahf6e', STAGE: 'prod', AWS_REGION: 'us-east-1', LAMBDA_WRAPPER_LOG: 'true' };
  const payload = { hello: 'world' };
  const response = { goodbye: 'world' };
  const type = 'Test';

  afterEach(() => {
    jest.resetModules();
    process.env = ORIGINAL_ENVS;
  });

  it('Handles missing Epsagon', () => {
    jest.doMock('epsagon', () => {
      return {
        __esModule: true,
        default: (function() {
          throw new Error();
        })()
      };
    });
    const { Metrics } = require('./metrics');
    const metrics = new Metrics(type);
    metrics.failure(response);
    expect(console.debug).toHaveBeenCalledWith(`Failure processing ${type} event, responding with`, response);
    expect(console.log).toHaveBeenCalledWith('failure', response);
  });

  it('Handles missing IOPipe', () => {
    jest.doMock('@iopipe/iopipe', () => {
      return {
        __esModule: true,
        default: (function() {
          throw new Error();
        })()
      };
    });
    const metrics = new Metrics(type);
    metrics.failure(response);
    expect(console.debug).toHaveBeenCalledWith(`Failure processing ${type} event, responding with`, response);
    expect(console.log).toHaveBeenCalledWith('failure', response);
  });
});
