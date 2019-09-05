import { dynamodbStream, DynamoDBStreamSignature } from '@manwaring/lambda-wrapper';
import 'source-map-support/register';

export const handler = dynamodbStream(async ({ success, error }: DynamoDBStreamSignature) => {
  try {
    return success();
  } catch (err) {
    return error(err);
  }
});
