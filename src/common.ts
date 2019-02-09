let epsagon: boolean, epsagon_label, iopipe: boolean, iopipe_metric, iopipe_label;
try {
  const lib = require('epsagon');
  epsagon = true;
  epsagon_label = lib.label;
} catch (err) {
  console.debug('Epsagon not installed in project, not tagging with Epsagon labels');
}
try {
  const lib = require('@iopipe/iopipe');
  iopipe = true;
  iopipe_metric = lib.metric;
  iopipe_label = lib.label;
} catch (err) {
  console.debug('IOPipe not installed in project, not tagging with IOPipe metrics');
}

export function tagCommonMetrics(): void {
  const { REVISION, STAGE, AWS_REGION } = process.env;
  if (epsagon) {
    tagEpsagon('revision', REVISION);
    tagEpsagon('stage', STAGE);
  }
  if (iopipe) {
    tagIOPipe('region', AWS_REGION);
    tagIOPipe('revision', REVISION);
    tagIOPipe('stage', STAGE);
  }
  if (noLogLibraries()) {
    console.log(`revision: ${REVISION}, stage: ${STAGE}, region: ${AWS_REGION}`);
  }
}

export function tagSuccess(information?: any): void {
  if (epsagon) {
    tagEpsagon('success');
  }
  if (iopipe) {
    tagIOPipe('success', information);
  }
  if (noLogLibraries()) {
    console.log('success', information);
  }
}

export function tagValid(information?: any): void {
  if (epsagon) {
    tagEpsagon('valid');
  }
  if (iopipe) {
    tagIOPipe('valid', information);
  }
  if (noLogLibraries()) {
    console.log('valid', information);
  }
}

export function tagInvalid(information?: any): void {
  if (epsagon) {
    tagEpsagon('invalid');
  }
  if (iopipe) {
    tagIOPipe('invalid', information);
  }
  if (noLogLibraries()) {
    console.log('invalid', information);
  }
}

export function tagRedirect(information?: any): void {
  if (epsagon) {
    tagEpsagon('redirect');
  }
  if (iopipe) {
    tagIOPipe('redirect', information);
  }
  if (noLogLibraries()) {
    console.log('redirect', information);
  }
}

export function tagError(information?: any): void {
  if (epsagon) {
    tagEpsagon('error');
  }
  if (iopipe) {
    tagIOPipe('error', information);
  }
  if (noLogLibraries()) {
    console.log('error', information);
  }
}

export function tagFailure(information?: any): void {
  if (epsagon) {
    tagEpsagon('failure');
  }
  if (iopipe) {
    tagIOPipe('failure', information);
  }
  if (noLogLibraries()) {
    console.log('failure', information);
  }
}

function tagEpsagon(key: string, value: any = false) {
  if (epsagon) {
    value ? epsagon_label(key, value) : epsagon_label(key);
  }
}

function tagIOPipe(key: string, value: any = false) {
  if (iopipe) {
    value ? iopipe_metric(key, value) : iopipe_label(key);
  }
}

function noLogLibraries(): boolean {
  return !epsagon && !iopipe;
}
