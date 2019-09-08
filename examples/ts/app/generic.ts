import { wrapper } from '@manwaring/lambda-wrapper';
import 'source-map-support/register';

export const handler = wrapper(async ({ event, success, error }) => {
  try {
    success(event);
  } catch (err) {
    error(err);
  }
});
