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
  });

  it('Tags success', () => {
    metrics.success(response);
    expect(console.debug).toHaveBeenCalledWith(`Successfully processed ${type} event, responding with`, response);
  });

  it('Tags valid', () => {
    metrics.valid(response);
    expect(console.debug).toHaveBeenCalledWith(`Valid ${type} event, responding with`, response);
  });

  it('Tags invalid', () => {
    metrics.invalid(response);
    expect(console.debug).toHaveBeenCalledWith(`Invalid ${type} event, responding with`, response);
  });

  it('Tags redirect', () => {
    metrics.redirect(response);
    expect(console.debug).toHaveBeenCalledWith(`Redirecting ${type} event, responding with`, response);
  });

  it('Tags error', () => {
    metrics.error(response);
    expect(console.debug).toHaveBeenCalledWith(`Error processing ${type} event, responding with`, response);
  });

  it('Tags failure', () => {
    metrics.failure(response);
    expect(console.debug).toHaveBeenCalledWith(`Failure processing ${type} event, responding with`, response);
  });
});
