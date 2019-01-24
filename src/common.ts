import { label } from 'epsagon';

export function tagCommonMetrics(): void {
  label('revision', process.env.REVISION);
  label('stage', process.env.STAGE);
}
