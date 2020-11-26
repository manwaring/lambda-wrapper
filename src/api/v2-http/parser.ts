import { parse } from "querystring";
import { HttpApiEvent } from "./payload";
import { Metrics, logger } from "../../common";

const metrics = new Metrics("API Gateway");

export class Request {
  constructor(private event: HttpApiEvent) {}

  getProperties(): {
    body: any;
    path: { [name: string]: string };
    rawPath: string;
    query: { [name: string]: string };
    rawQueryString: string;
    headers: { [name: string]: string };
    testRequest: boolean;
    auth: any;
  } {
    const event = this.event;
    const path = event.pathParameters || undefined;
    const rawPath = event.rawPath || undefined;
    const query = event.queryStringParameters || undefined;
    const rawQueryString = event.rawQueryString || undefined;
    const auth = this.getAuth();
    const headers = event.headers || undefined;
    const body = new Body(event.body, headers).getParsedBody();
    const TEST_REQUEST_HEADER = process.env.TEST_REQUEST_HEADER || "test-request";
    const testRequest = headers && headers[TEST_REQUEST_HEADER] ? JSON.parse(headers[TEST_REQUEST_HEADER]) : false;
    const parsed = { body, path, rawPath, query, rawQueryString, auth, headers, testRequest };
    metrics.common(parsed, event);
    return parsed;
  }

  private getAuth() {
    const authorizer = this.event?.requestContext?.authorizer?.jwt;
    return authorizer ? authorizer : undefined;
  }
}

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
          logger.error("Content-Type header not found, attempting to parse as JSON");
          parsedBody = JSON.parse(this.body);
        }
      } catch (err) {
        logger.error("Error parsing body, returning as-is", err, this.body);
        parsedBody = this.body;
      }
    }
    return parsedBody;
  }

  private getContentType(): string {
    return (
      this.headers && (this.headers["Content-Type"] || this.headers["CONTENT-TYPE"] || this.headers["content-type"])
    );
  }

  private isFormUrlEncoded(contentType?: string): boolean {
    return contentType?.toUpperCase().includes("APPLICATION/X-WWW-FORM-URLENCODED");
  }

  private isJSON(contentType: string): boolean {
    return contentType?.toUpperCase().includes("APPLICATION/JSON");
  }
}
