import { api } from '@manwaring/lambda-wrapper';
import 'source-map-support/register';

export const handler = api(async ({ event, success, error }) => {
  try {
    return success(event);
  } catch (err) {
    return error(err);
  }
});
