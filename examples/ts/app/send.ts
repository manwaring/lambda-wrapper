import { CloudFormationCustomResourceEvent, Context } from 'aws-lambda';
import axios from 'axios';
import * as retry from 'async-retry';

const MAX_RETRIES = 10;

type ResponseStatus = 'SUCCESS' | 'FAILED';
export const SUCCESS: ResponseStatus = 'SUCCESS';
export const FAILED: ResponseStatus = 'FAILED';

export function send(
  event: CloudFormationCustomResourceEvent,
  context: Context,
  Status: ResponseStatus,
  Data: any = {},
  physicalResourceId: any = false,
  NoEcho: any = false
) {
  const body = JSON.stringify({
    Status,
    Reason: `See the details in CloudWatch Log Stream: ${context.logStreamName}`,
    PhysicalResourceId: physicalResourceId || context.logStreamName,
    StackId: event.StackId,
    RequestId: event.RequestId,
    LogicalResourceId: event.LogicalResourceId,
    NoEcho,
    Data
  });
  try {
    sendResponse(event.ResponseURL, body)
      .then(() => {
        console.log('Promise chain success');
        context.done();
      })
      .catch(err => {
        console.error('Promise chain error', err);
        context.done();
      });
    console.log('After promise chain');
  } catch (err) {
    console.log('Try catch error', err);
  }
  console.log('Reached end of sending calls');
}

async function retrySendResponse(url, body): Promise<any> {
  console.log('Initiating retry call');
  return await retry(
    async (abort, attemptCount) => {
      console.log(`Making retry call ${attemptCount} of ${MAX_RETRIES}`);
      await sendResponse(url, body);
    },
    { retries: MAX_RETRIES }
  );
}

async function sendResponse(url, body): Promise<any> {
  const config = { headers: { 'content-type': '', 'content-length': body.length } };
  console.log('Making request with params', url, body, config);
  const response = await axios.put(url, body, config);
  console.log('Completed making request', response);
  return response;
}
