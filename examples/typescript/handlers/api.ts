import { api, ApiSignature } from '@manwaring/lambda-wrapper';

export const handler = api(async ({ event, success, error }: ApiSignature) => {
  try {
    return success(event);
  } catch (err) {
    return error(err);
  }
});
