import { api } from '@manwaring/lambda-wrapper';
import 'source-map-support/register';

export const handler = api(async ({ event, path = {}, success, error }) => {
  try {
    const { query } = path;
    console.log(query);
    const replacer = (key, value) => {
      switch (key) {
        case 'prop-to-ignore':
          return undefined;
        default:
          return value;
      }
    };
    return success(event, replacer);
  } catch (err) {
    return error(err);
  }
});
