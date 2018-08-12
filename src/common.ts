import { APIGatewayEvent } from 'aws-lambda';
import { metric } from '@iopipe/iopipe';

export function tagCommonMetrics(): void {
  metric('region', process.env.AWS_REGION);
  metric('revision', process.env.REVISION);
  metric('stage', process.env.STAGE);
}
