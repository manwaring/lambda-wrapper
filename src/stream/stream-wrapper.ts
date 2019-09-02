import { DynamoDBStreams } from 'aws-sdk';
import { Stream, Version } from './stream';
import { Metrics } from '../common';

const metrics = new Metrics('Stream');

export function streamWrapper<T extends Function>(fn: T): T {
  return <any>function(event: DynamoDBStreams.GetRecordsOutput) {
    const { newVersions, oldVersions, versions } = new Stream(event).getVersions();
    metrics.common({ newVersions, oldVersions, versions });

    function success(message: any = ''): void {
      metrics.success(message);
      return message;
    }

    function error(error: any = ''): void {
      metrics.error(error);
      throw new Error(error);
    }

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
