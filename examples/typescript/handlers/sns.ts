import { sns, SnsSignature } from '@manwaring/lambda-wrapper';

export const handler = sns(async ({ event, success, error }: SnsSignature) => {
  try {
    return success();
  } catch (err) {
    return error(err);
  }
});
