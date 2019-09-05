import { dynamodbStream } from '@manwaring/lambda-wrapper';

export const handler = dynamodbStream(async ({ success, error }: DynamoDBStreamSignature) => {
  try {
    return success();
  } catch (err) {
    return error(err);
  }
});
