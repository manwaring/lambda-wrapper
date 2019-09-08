import { sns } from '@manwaring/lambda-wrapper';
import 'source-map-support/register';

export const handler = sns(async ({ success, error }) => {
  try {
    return success();
  } catch (err) {
    return error(err);
  }
});
