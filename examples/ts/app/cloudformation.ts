import { cloudFormation } from '@manwaring/lambda-wrapper';
import 'source-map-support/register';

export const handler = cloudFormation(async ({ event, success, failure }) => {
  try {
    return success(event);
  } catch (err) {
    return failure(err);
  }
});
