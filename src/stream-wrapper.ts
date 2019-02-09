import { DynamoDB, DynamoDBStreams } from 'aws-sdk';
import { tagCommonMetrics, tagSuccess, tagError } from './common';

export function streamWrapper<T extends Function>(fn: T): T {
  return <any>function(event: DynamoDBStreams.GetRecordsOutput, context, callback) {
    tagCommonMetrics();
    const { newVersions, oldVersions, versions } = getStreamInformation(event);
    console.debug('Received stream request', newVersions, oldVersions, versions);

    function success(message: any = ''): void {
      tagSuccess();
      console.info('Successfully processed request, returning response payload', message ? message : '');
      return callback(null, message);
    }

    function error(error: any = ''): void {
      tagError();
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
  event: DynamoDBStreams.GetRecordsOutput; // original event
  newVersions: any[]; // array of all unmarshalled javascript objects of new images
  oldVersions: any[]; // array of all unmarshalled javascript objects of old images
  versions: Version[]; // array of full version object (new image, old image, etc - see Version interface)
  success(message?: any): void; // invokes lambda callback with success
  error(error?: any): void; // invokes lambda callback with error
}

export interface Version {
  newVersion: any; // unmarshalled javascript object of new image (if exists) or null
  oldVersion: any; // unmarshalled javascript object of old image (if exists) or null
  keys: any; // unmarshalled javascript object of keys (includes key values)
  tableName: string; // name of the table the object came from
  tableArn: string; // arn of the table the object came from
  eventName: string; // name of the event (INSERT || MODIFY || REMOVE)
}

// Used internally to this class for brevity in private method signatures
interface Event extends DynamoDBStreams.GetRecordsOutput {}
interface Record extends DynamoDBStreams.Record {}
