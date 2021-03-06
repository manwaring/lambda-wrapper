import { DynamoDBStreamEvent, DynamoDBRecord } from 'aws-lambda';
import { DynamoDB, DynamoDBStreams } from 'aws-sdk';

export class DynamoDBStreamParser<T = any> {
  constructor(private event: DynamoDBStreamEvent) {}

  getVersions(): { newVersions: any[]; oldVersions: any[]; versions: Version<T>[] } {
    let newVersions = [];
    let oldVersions = [];
    let versions: Version<T>[] = [];
    this.event.Records.forEach((record) => {
      const { newVersion, oldVersion, version } = this.parseVersions(record);
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

  private parseVersions(record: DynamoDBRecord) {
    const { eventName } = record;
    const { NewImage, OldImage, Keys } = record.dynamodb;
    const newVersion = NewImage ? (DynamoDB.Converter.unmarshall(NewImage) as T) : undefined;
    const oldVersion = OldImage ? (DynamoDB.Converter.unmarshall(OldImage) as T) : undefined;
    const keys = DynamoDB.Converter.unmarshall(Keys);
    const { tableName, tableArn } = this.getTableInformation(record);
    const version: Version<T> = { newVersion, oldVersion, keys, tableName, tableArn, eventName };
    return { newVersion, oldVersion, version };
  }

  private getTableInformation(record: DynamoDBRecord): { tableName: string; tableArn: string } {
    let streamArn = record['eventSourceARN'];
    const tableArn = streamArn.split('/stream/')[0];
    const tableName = tableArn.split(':table/')[1];
    return { tableName, tableArn };
  }
}

export interface Version<T> {
  newVersion: T; // unmarshalled javascript object of new image (if exists) or null
  oldVersion: T; // unmarshalled javascript object of old image (if exists) or null
  keys: any; // unmarshalled javascript object of keys (includes key values)
  tableName: string; // name of the table the object came from
  tableArn: string; // arn of the table the object came from
  eventName: 'INSERT' | 'MODIFY' | 'REMOVE'; // name of the event (INSERT || MODIFY || REMOVE)
}
