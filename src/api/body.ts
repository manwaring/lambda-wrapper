import { parse } from 'querystring';
import { logger } from '../common/log';

export class Body {
  constructor(private body: any, private headers: { [name: string]: string }) {}

  getParsedBody(): any {
    let parsedBody;
    if (this.body) {
      try {
        const contentType = this.getContentType();
        if (this.isFormUrlEncoded(contentType)) {
          parsedBody = parse(this.body);
        } else if (this.isJSON(contentType)) {
          parsedBody = JSON.parse(this.body);
        } else {
          logger.error('Content-Type header not found, unable to parse body');
          parsedBody = this.body;
        }
      } catch (err) {
        logger.error('Error parsing body', err, this.body);
        parsedBody = this.body;
      }
    }
    return parsedBody;
  }

  private getContentType(): string {
    return this.headers['Content-Type'] || this.headers['CONTENT-TYPE'] || this.headers['content-type'];
  }

  private isFormUrlEncoded(contentType: string): boolean {
    return contentType && contentType.toUpperCase() === 'APPLICATION/X-WWW-FORM-URLENCODED';
  }

  private isJSON(contentType: string): boolean {
    return contentType && contentType.toUpperCase() === 'APPLICATION/JSON';
  }
}
