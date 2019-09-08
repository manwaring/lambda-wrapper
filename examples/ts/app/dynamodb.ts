import { dynamodbStream } from '@manwaring/lambda-wrapper';
import 'source-map-support/register';

export const handler = dynamodbStream(async ({ newVersions, success, error }) => {
  try {
    return success(newVersions);
  } catch (err) {
    return error(err);
  }
});
