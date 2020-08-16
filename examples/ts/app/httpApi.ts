import { httpApi } from '@manwaring/lambda-wrapper';
import 'source-map-support/register';

export const handler = httpApi(async ({ event, path, success, error }) => {
  try {
    const { query } = path;    
    return success({ body: { event, query } });
  } catch (err) {
    return error({ err });
  }
});
