import { DynamoDBStreams } from 'aws-sdk';
import { DynamoDBStreamParser, Version } from './parser';
import { Metrics } from '../common';
import { success, error } from './responses';

const metrics = new Metrics('DynamoDB Stream');

export function streamWrapper<T extends Function>(fn: T): T {
  return <any>function(event: DynamoDBStreams.GetRecordsOutput) {
    const { newVersions, oldVersions, versions } = new DynamoDBStreamParser(event).getVersions();
    metrics.common({ newVersions, oldVersions, versions });

    const signature: StreamSignature = { event, newVersions, oldVersions, versions, success, error };
    return fn(signature);
  };
}

export interface StreamSignature {
  event: DynamoDBStreams.GetRecordsOutput; // original event
  newVersions: any[]; // array of all unmarshalled javascript objects of new images
  oldVersions: any[]; // array of all unmarshalled javascript objects of old images
  versions: Version[]; // array of full version object (new image, old image, etc - see Version interface)
  success(message?: any): void; // invokes lambda callback with success
  error(error?: any): void; // invokes lambda callback with error
}
