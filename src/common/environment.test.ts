import { isRunningInAwsLambdaEnvironment } from './environment';

describe('Runtime environment determination', () => {
  const ORIGINAL_ENVS = process.env;
  const FULL_LAMBDA_RUNTIME = {
    _HANDLER: 'index.handler',
    AWS_REGION: 'us-east-1',
    AWS_EXECUTION_ENV: 'AWS_Lambda_nodejs10.x',
    AWS_LAMBDA_FUNCTION_NAME: 'sample-function-name',
    AWS_LAMBDA_FUNCTION_MEMORY_SIZE: '128',
    AWS_LAMBDA_FUNCTION_VERSION: '$LATEST',
    LAMBDA_TASK_ROOT: '/var/task',
    LAMBDA_RUNTIME_DIR: '/var/runtime'
  };

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENVS };
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
    const keys = Object.keys(FULL_LAMBDA_RUNTIME);
    delete FULL_LAMBDA_RUNTIME[keys[(Math.random() * keys.length) << 0]];
    process.env = { ...ORIGINAL_ENVS, ...FULL_LAMBDA_RUNTIME };
    expect(isRunningInAwsLambdaEnvironment()).toBe(false);
  });
});
