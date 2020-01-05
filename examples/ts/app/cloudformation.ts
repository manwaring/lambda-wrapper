import { cloudFormation } from '@manwaring/lambda-wrapper';
import 'source-map-support/register';

export const handler = cloudFormation(({ event, success, failure }) => {
  try {
    return success(event.ResourceProperties.BucketName);
  } catch (err) {
    return failure(err);
  }
});
