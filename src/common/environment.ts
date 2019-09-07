export const EXPECTED_ENV_VARS = [
  '_HANDLER',
  'AWS_REGION',
  'AWS_EXECUTION_ENV',
  'AWS_LAMBDA_FUNCTION_NAME',
  'AWS_LAMBDA_FUNCTION_MEMORY_SIZE',
  'AWS_LAMBDA_FUNCTION_VERSION',
  'LAMBDA_TASK_ROOT',
  'LAMBDA_RUNTIME_DIR'
];

export function isRunningInAwsLambdaEnvironment(): boolean {
  const missingEnvVars = EXPECTED_ENV_VARS.filter(expected => !process.env[expected]);
  if (missingEnvVars.length > 0 && process.env.DEBUG) {
    console.debug(
      'Code is not running in an AWS Lambda Environment, missing the following environment variables:',
      missingEnvVars
    );
  }
  return missingEnvVars.length === 0;
}
