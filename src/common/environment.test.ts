import { isRunningInAwsLambdaEnvironment, EXPECTED_ENV_VARS } from './environment';

export const FULL_LAMBDA_RUNTIME = {
  _HANDLER: 'index.handler',
  AWS_REGION: 'us-east-1',
  AWS_EXECUTION_ENV: 'AWS_Lambda_nodejs10.x',
  AWS_LAMBDA_FUNCTION_NAME: 'sample-function-name',
  AWS_LAMBDA_FUNCTION_MEMORY_SIZE: '128',
  AWS_LAMBDA_FUNCTION_VERSION: '$LATEST',
  LAMBDA_TASK_ROOT: '/var/task',
  LAMBDA_RUNTIME_DIR: '/var/runtime'
};

describe('Runtime environment determination', () => {
  const ORIGINAL_ENVS = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENVS };
    console.debug = jest.fn();
  });

  it('Default environment is recognized as not AWS Lambda runtime', () => {
    expect(isRunningInAwsLambdaEnvironment()).toBe(false);
  });

  it('Fully modified environment is recognized as AWS Lambda runtime', () => {
    process.env = { ...ORIGINAL_ENVS, ...FULL_LAMBDA_RUNTIME };
    expect(isRunningInAwsLambdaEnvironment()).toBe(true);
  });

  it('Partially modified environment is not recognized as AWS Lambda runtime', () => {
    // Delete a random property from the lambda runtime object
    process.env = { ...ORIGINAL_ENVS, ...FULL_LAMBDA_RUNTIME };
    const varToRemove = EXPECTED_ENV_VARS[(Math.random() * EXPECTED_ENV_VARS.length) << 0];
    delete process.env[varToRemove];
    expect(isRunningInAwsLambdaEnvironment()).toBe(false);
  });

  it('Logs about why not recognized as AWS Lambda runtime given proper DEBUG flag', () => {
    // Delete a random property from the lambda runtime object
    process.env = { ...ORIGINAL_ENVS, ...FULL_LAMBDA_RUNTIME, ...{ DEBUG: 'true' } };
    const varToRemove = EXPECTED_ENV_VARS[(Math.random() * EXPECTED_ENV_VARS.length) << 0];
    delete process.env[varToRemove];
    expect(isRunningInAwsLambdaEnvironment()).toBe(false);
    expect(console.debug).toHaveBeenCalledWith(
      'Code is not running in an AWS Lambda Environment, missing the following environment variables:',
      [varToRemove]
    );
  });
});
