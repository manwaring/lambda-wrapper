import { SNSEvent } from 'aws-lambda';

export class SnsParser {
  constructor(private event: SNSEvent) {}

  getMessage() {
    let message = this.event.Records[0].Sns.Message;
    try {
      message = JSON.parse(message);
    } catch (err) {}
    return message;
  }
}
