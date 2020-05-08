import { SNSEvent } from 'aws-lambda';

export class SnsParser<T> {
  constructor(private event: SNSEvent) {}

  getMessage(): T {
    let message = this.event.Records[0].Sns.Message;
    try {
      message = JSON.parse(message);
    } catch (err) {}
    return (<unknown>message) as T;
  }
}
