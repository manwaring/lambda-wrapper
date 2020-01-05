import { Metrics } from './metrics';

describe('Metrics recording', () => {
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
    console.info = jest.fn();
  });

  it('Records common', () => {
    metrics.common(payload);
    expect(console.debug).toHaveBeenCalledWith(`Received ${type} event payload`, payload);
  });

  it('Records success', () => {
    metrics.success(response);
    expect(console.debug).toHaveBeenCalledWith(`Successfully processed ${type} event, responding with`, response);
  });

  it('Records valid', () => {
    metrics.valid(response);
    expect(console.debug).toHaveBeenCalledWith(`Valid ${type} event, responding with`, response);
  });

  it('Records invalid', () => {
    metrics.invalid(response);
    expect(console.debug).toHaveBeenCalledWith(`Invalid ${type} event, responding with`, response);
  });

  it('Records not found', () => {
    metrics.notFound(response);
    expect(console.debug).toHaveBeenCalledWith(`Unable to find record for ${type} event, responding with`, response);
  });

  it('Records redirect', () => {
    metrics.redirect(response);
    expect(console.debug).toHaveBeenCalledWith(`Redirecting ${type} event, responding with`, response);
  });

  it('Records error', () => {
    metrics.error(response);
    expect(console.debug).toHaveBeenCalledWith(`Error processing ${type} event, responding with`, response);
  });

  it('Records failure', () => {
    metrics.failure(response);
    expect(console.debug).toHaveBeenCalledWith(`Failure processing ${type} event, responding with`, response);
  });
});
