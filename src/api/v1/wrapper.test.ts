/* eslint-disable @typescript-eslint/no-empty-function */
import { apiGatewayEvent } from "serverless-plugin-test-helper";
import { api, ApiSignature } from "./wrapper";

describe("API wrapper", () => {
  const requestEvent = apiGatewayEvent({
    body: JSON.stringify({ hello: "world" }),
    pathParameters: { proxy: "not today" },
    queryStringParameters: { name: "a test" },
    headers: { "content-type": "application/json", "test-request": "true" },
    requestContext: {
      connectionId: "abc-123",
    },
  });
  const context = {
    callbackWaitsForEmptyEventLoop: false,
    functionName: "function-name",
    functionVersion: "$LATEST",
    invokedFunctionArn: "arn:",
    memoryLimitInMB: "128",
    awsRequestId: "request",
    logGroupName: "group",
    logStreamName: "stream",
    getRemainingTimeInMillis: () => 2,
    done: () => {},
    fail: () => {},
    succeed: () => {},
  };
  const callback = jest.fn((err, result) => (err ? new Error(err) : result));

  it("Has expected properties and response functions", () => {
    function customHandler({
      event,
      websocket,
      body,
      path,
      query,
      headers,
      testRequest,
      auth,
      success,
      notFound,
      notAuthorized,
      invalid,
      redirect,
      error,
      custom,
    }: ApiSignature) {
      expect(event).toEqual(requestEvent);
      expect(websocket.connectionId).toEqual("abc-123");
      expect(body).toEqual({ hello: "world" });
      expect(path).toEqual({ proxy: "not today" });
      expect(query).toEqual({ name: "a test" });
      expect(headers["content-type"]).toEqual("application/json");
      expect(testRequest).toEqual(true);
      expect(auth).toBeTruthy();
      expect(success).toBeInstanceOf(Function);
      expect(notFound).toBeInstanceOf(Function);
      expect(notAuthorized).toBeInstanceOf(Function);
      expect(invalid).toBeInstanceOf(Function);
      expect(redirect).toBeInstanceOf(Function);
      expect(error).toBeInstanceOf(Function);
      expect(custom).toBeInstanceOf(Function);
      success({ body: "success" });
    }
    api(customHandler)(requestEvent, context, callback);
  });

  it("Has expected properties and response functions with optional generic type", () => {
    interface CustomType {
      Message: string;
      Id: number;
    }
    function customHandler({
      event,
      websocket,
      body,
      path,
      query,
      headers,
      testRequest,
      auth,
      success,
      notFound,
      notAuthorized,
      invalid,
      redirect,
      error,
      custom,
    }: ApiSignature<CustomType>) {
      expect(event).toEqual(requestEvent);
      expect(websocket.connectionId).toEqual("abc-123");
      expect(body).toEqual({ hello: "world" });
      expect(path).toEqual({ proxy: "not today" });
      expect(query).toEqual({ name: "a test" });
      expect(headers["content-type"]).toEqual("application/json");
      expect(testRequest).toEqual(true);
      expect(auth).toBeTruthy();
      expect(success).toBeInstanceOf(Function);
      expect(notFound).toBeInstanceOf(Function);
      expect(notAuthorized).toBeInstanceOf(Function);
      expect(invalid).toBeInstanceOf(Function);
      expect(redirect).toBeInstanceOf(Function);
      expect(error).toBeInstanceOf(Function);
      expect(custom).toBeInstanceOf(Function);
      success({ body: "success" });
    }
    api(customHandler)(requestEvent, context, callback);
  });
});
