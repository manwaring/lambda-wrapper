import { APIGatewayEvent } from 'aws-lambda';
// import { metric } from '@iopipe/iopipe';
import { label } from 'epsagon';

export function tagCommonMetrics(): void {
  // metric('region', process.env.AWS_REGION);
  // metric('revision', process.env.REVISION);
  // metric('stage', process.env.STAGE);
  label('region', process.env.AWS_REGION);
  label('revision', process.env.REVISION);
  label('stage', process.env.STAGE);
}
