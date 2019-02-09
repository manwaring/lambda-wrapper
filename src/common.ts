let epsagon: boolean, epsagon_label, iopipe: boolean, iopipe_metric;
try {
  const lib = require('epsagon');
  epsagon = true;
  epsagon_label = lib.label;
} catch (err) {
  console.log('Epsagon not installed in project, not using for tagging');
}
try {
  const lib = require('@iopipe/iopipe');
  iopipe = true;
  iopipe_metric = lib.metric;
} catch (err) {
  console.log('IOPipe not installed in project, not using for labelling');
}

export function tagCommonMetrics(): void {
  const { REVISION, STAGE, AWS_REGION } = process.env;
  if (epsagon) {
    label('revision', REVISION);
    label('stage', STAGE);
  }
  if (iopipe) {
    metric('region', AWS_REGION);
    metric('revision', REVISION);
    metric('stage', STAGE);
  }
  if (noLogLibraries()) {
    console.log(`revision: ${REVISION}, stage: ${STAGE}, region: ${AWS_REGION}`);
  }
}

export function tagSuccess(information?: any): void {
  if (epsagon) {
    label('success');
  }
  if (iopipe) {
    metric('success', information);
  }
  if (noLogLibraries()) {
    console.log('success', information);
  }
}

export function tagValid(information?: any): void {
  if (epsagon) {
    label('valid');
  }
  if (iopipe) {
    metric('valid', information);
  }
  if (noLogLibraries()) {
    console.log('valid', information);
  }
}

export function tagInvalid(information?: any): void {
  if (epsagon) {
    label('invalid');
  }
  if (iopipe) {
    metric('invalid', information);
  }
  if (noLogLibraries()) {
    console.log('invalid', information);
  }
}

export function tagRedirect(information?: any): void {
  if (epsagon) {
    label('redirect');
  }
  if (iopipe) {
    metric('redirect', information);
  }
  if (noLogLibraries()) {
    console.log('redirect', information);
  }
}

export function tagError(information?: any): void {
  if (epsagon) {
    label('error');
  }
  if (iopipe) {
    metric('error', information);
  }
  if (noLogLibraries()) {
    console.log('error', information);
  }
}

export function tagFailure(information?: any): void {
  if (epsagon) {
    label('failure');
  }
  if (iopipe) {
    metric('failure', information);
  }
  if (noLogLibraries()) {
    console.log('failure', information);
  }
}

function label(key: string, value: any = false) {
  if (epsagon) {
    value ? epsagon_label(key, value) : epsagon_label(key);
  }
}

function metric(key: string, value: any = false) {
  if (iopipe) {
    value ? iopipe_metric(key, value) : iopipe_metric(key);
  }
}

function noLogLibraries(): boolean {
  return !epsagon && !iopipe;
}
