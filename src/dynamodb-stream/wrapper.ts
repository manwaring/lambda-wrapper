import { DynamoDBStreamEvent, Context, Callback } from 'aws-lambda';
import { DynamoDBStreamParser, Version } from './parser';
import { Metrics } from '../common';
import { success, error } from './responses';

const metrics = new Metrics('DynamoDB Stream');

export function dynamodbStream<T = any>(
  custom: (props: DynamoDBStreamSignature<T>) => any
): (event: DynamoDBStreamEvent, context: Context, callback: Callback) => any {
  return function handler(event: DynamoDBStreamEvent, context: Context, callback: Callback) {
    const { newVersions, oldVersions, versions } = new DynamoDBStreamParser<T>(event).getVersions();
    metrics.common({ newVersions, oldVersions, versions });
    return custom({ event, newVersions, oldVersions, versions, success, error });
  };
}

export interface DynamoDBStreamSignature<T = any> {
  event: DynamoDBStreamEvent; // original event
  newVersions: T[]; // array of all unmarshalled javascript objects of new images
  oldVersions: T[]; // array of all unmarshalled javascript objects of old images
  versions: Version<T>[]; // array of full version object (new image, old image, etc - see Version interface)
  success(message?: any): any; // logs and returns the message
  error(error?: any): void; // logs the error and throws it
}
