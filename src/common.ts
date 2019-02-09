import { label } from 'epsagon';
import { metric } from '@iopipe/iopipe';

export function tagCommonMetrics(): void {
  label('revision', process.env.REVISION);
  label('stage', process.env.STAGE);
  metric('region', process.env.AWS_REGION);
  metric('revision', process.env.REVISION);
  metric('stage', process.env.STAGE);
}

export function tagSuccess(information?: any): void {
  label('success');
  metric('success', information);
}

export function tagValid(information?: any): void {
  label('valid');
  metric('valid', information);
}

export function tagInvalid(information?: any): void {
  label('invalid');
  metric('invalid', information);
}

export function tagRedirect(information?: any): void {
  label('redirect');
  metric('redirect', information);
}

export function tagError(information?: any): void {
  label('error');
  metric('error', information);
}

export function tagFailure(information?: any): void {
  label('failure');
  metric('failure', information);
}
