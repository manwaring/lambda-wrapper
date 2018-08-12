import { DynamoDB, DynamoDBStreams } from 'aws-sdk';
import { label, metric } from '@iopipe/iopipe';
import { tagCommonMetrics } from './common';

export function streamWrapper<T extends Function>(fn: T): T {
  return <any>function(event: DynamoDBStreams.GetRecordsOutput, context, callback) {
    tagCommonMetrics();
    const { newVersions, oldVersions, versions } = getStreamInformation(event);
    console.debug('Received stream request', newVersions, oldVersions, versions);

    function success(message: any): void {
      label('success');
      console.info('Successfully processed request, returning response payload', message);
      return callback(null, message);
    }

    function error(error: any): void {
      label('error');
      metric('error', error);
      console.error('Error processing request, returning error payload', error);
      return callback(error);
    }

    const signature: StreamSignature = { event, newVersions, oldVersions, versions, success, error };
    return fn(signature);
  };
}

function getStreamInformation(event: Event): { newVersions: any[]; oldVersions: any[]; versions: Version[] } {
  let newVersions = [];
  let oldVersions = [];
  let versions = [];
  event.Records.forEach(record => {
    const { newVersion, oldVersion, version } = getVersions(record);
    if (newVersion) {
      newVersions.push(newVersion);
    }
    if (oldVersion) {
      oldVersions.push(oldVersion);
    }
    if (version) {
      versions.push(version);
    }
  });
  return { newVersions, oldVersions, versions };
}

function getVersions(record: Record): { newVersion: any; oldVersion: any; version: Version } {
  const { eventName } = record;
  const { NewImage, OldImage, Keys } = record.dynamodb;
  const newVersion = NewImage ? DynamoDB.Converter.unmarshall(NewImage) : null;
  const oldVersion = OldImage ? DynamoDB.Converter.unmarshall(OldImage) : null;
  const keys = DynamoDB.Converter.unmarshall(Keys);
  const { tableName, tableArn } = getTableInformation(record);
  const version: Version = { newVersion, oldVersion, keys, tableName, tableArn, eventName };
  return { newVersion, oldVersion, version };
}

function getTableInformation(record: Record): { tableName: string; tableArn: string } {
  let streamArn = record['eventSourceARN'];
  const tableArn = streamArn.split('/stream/')[0];
  const tableName = tableArn.split(':table/')[1];
  return { tableName, tableArn };
}

export interface StreamSignature {
  event: DynamoDBStreams.GetRecordsOutput;
  newVersions: any[];
  oldVersions: any[];
  versions: Version[];
  success(message: any): void;
  error(error: any): void;
}

export interface Version {
  newVersion: any;
  oldVersion: any;
  keys: any;
  tableName: string;
  tableArn: string;
  eventName: string;
}

// Used internally to this class for brevity in private method signatures
interface Event extends DynamoDBStreams.GetRecordsOutput {}
interface Record extends DynamoDBStreams.Record {}
