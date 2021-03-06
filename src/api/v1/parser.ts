import { APIGatewayEvent } from "aws-lambda";
import { parse } from "querystring";
import { Metrics, logger } from "../../common";

const metrics = new Metrics("API Gateway");

export class Request {
  constructor(private event: APIGatewayEvent) {}

  getProperties(): any {
    const event = this.event;
    const websocket = event.requestContext ? event.requestContext : undefined;
    const path = event.pathParameters ? event.pathParameters : undefined;
    const query = event.queryStringParameters ? event.queryStringParameters : undefined;
    const auth = this.getAuth();
    const headers = event.headers ? event.headers : undefined;
    const body = new Body(event.body, headers).getParsedBody();
    const TEST_REQUEST_HEADER = process.env.TEST_REQUEST_HEADER || "test-request";
    const testRequest = headers && headers[TEST_REQUEST_HEADER] ? JSON.parse(headers[TEST_REQUEST_HEADER]) : false;
    const parsed = { body, websocket, path, query, auth, headers, testRequest };
    metrics.common(parsed, event);
    return parsed;
  }

  private getAuth() {
    const authorizer = this.event?.requestContext?.authorizer;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const httpApiAuth = this.event.auth;
    return authorizer ? authorizer : httpApiAuth;
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
