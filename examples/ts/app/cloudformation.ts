import { cloudFormation } from '@manwaring/lambda-wrapper';
import 'source-map-support/register';

export const handler = cloudFormation(({ event, success, failure }) => {
  try {
    success(event.ResourceProperties.BucketName);
  } catch (err) {
    failure(err);
  }
});
