import { wrapper } from '@manwaring/lambda-wrapper';
import 'source-map-support/register';

export const handler = wrapper(async ({ event, success, error }) => {
  try {
    return success(event);
  } catch (err) {
    return error(err);
  }
});
