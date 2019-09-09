import { cloudFormation } from '@manwaring/lambda-wrapper';
import 'source-map-support/register';
// import { send, SUCCESS } from './send';
import { sendResponse } from './native-send';

// export const handler = cloudFormation(async ({ event, success, failure }) => {
//   try {
//     success(event);
//   } catch (err) {
//     failure(err);
//   }
// });

export const handler = (event, context, callback) => {
  try {
    // send(event, context, SUCCESS);
    sendResponse(event, context);
  } catch (err) {
    console.log('Error', err);
    // send(event, context, SUCCESS);
    sendResponse(event, context);
  }
};
