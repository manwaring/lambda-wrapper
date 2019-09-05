import { sns, SnsSignature } from '@manwaring/lambda-wrapper';
import 'source-map-support/register';

export const handler = sns(async ({ success, error }: SnsSignature) => {
  try {
    return success();
  } catch (err) {
    return error(err);
  }
});
