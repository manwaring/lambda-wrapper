import { cloudFormation } from '@manwaring/lambda-wrapper';
import 'source-map-support/register';

export const handler = cloudFormation(({ success, failure }) => {
  try {
    success();
  } catch (err) {
    failure(err);
  }
});
