import { Metrics, logger } from "../../common";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
  "Access-Control-Allow-Headers": "*",
};

const metrics = new Metrics("API Gateway");

const defaultSuccess: ResponseParameters = {
  cors: true,
  statusCode: 200,
};

export function success({
  body,
  json = true,
  cors = true,
  statusCode = 200,
  headers,
}: ResponseParameters = defaultSuccess): ApiResponse {
  const response = getResponseFromParameters({ body, json, cors, statusCode, headers });
  metrics.success(response);
  return response;
}

const defaultInvalid: ResponseParameters = {
  cors: true,
  statusCode: 400,
};

export function invalid({
  body,
  json = true,
  cors = true,
  statusCode = 400,
  headers,
}: ResponseParameters = defaultInvalid): ApiResponse {
  const response = getResponseFromParameters({ body, json, cors, statusCode, headers });
  metrics.invalid(response);
  return response;
}

export function custom({ body, json = true, cors = true, statusCode, headers }: CustomParameters): ApiResponse {
  const response = getResponseFromParameters({ body, json, cors, statusCode, headers });
  metrics.custom(response);
  return response;
}

const defaultNotFound: ResponseParameters = {
  cors: true,
  statusCode: 404,
};

export function notFound({
  body,
  json = true,
  cors = true,
  statusCode = 404,
  headers,
}: ResponseParameters = defaultNotFound): ApiResponse {
  const response = getResponseFromParameters({ body, json, cors, statusCode, headers });
  metrics.invalid(response);
  return response;
}

const defaultNotAuthorized: ResponseParameters = {
  cors: true,
  statusCode: 401,
};

export function notAuthorized({
  body,
  json = true,
  cors = true,
  statusCode = 401,
  headers,
}: ResponseParameters = defaultNotAuthorized): ApiResponse {
  const response = getResponseFromParameters({ body, json, cors, statusCode, headers });
  metrics.invalid(response);
  return response;
}

const defaultError: ResponseParameters = {
  cors: true,
  statusCode: 500,
};

export function error({
  body,
  json = true,
  cors = true,
  statusCode = 500,
  headers,
  err,
}: ErrorParameters = defaultError): ApiResponse {
  if (err) {
    logger.debug("Encountered error while processing request", err);
  }
  const response = getResponseFromParameters({ body, json, cors, statusCode, headers });
  metrics.error(response);
  return response;
}

export function redirect({ url, cors = true, statusCode = 302, headers }: RedirectParameters): ApiResponse {
  const response = {
    statusCode,
    headers: cors ? { Location: url, ...headers, ...CORS_HEADERS } : { Location: url, ...headers },
  };
  metrics.redirect(response);
  return response;
}

function getResponseFromParameters({ body, json, cors, statusCode, headers }: ResponseParameters) {
  const response = {
    statusCode,
    headers: cors ? { ...headers, ...CORS_HEADERS } : headers,
  };
  if (body) {
    if (json) {
      response["body"] = JSON.stringify(body);
      response.headers["Content-Type"] = "application/json";
    } else {
      response["body"] = body;
    }
  }
  return response;
}

export interface ApiResponse {
  statusCode: number;
  headers: { [name: string]: any };
  body?: string;
}

export interface ResponseParameters {
  body?: any; // response body
  json?: boolean; // indicates if body should be JSON-stringified and content-type header set to application/json, defaults to true
  cors?: boolean; // indicates if CORS headers should be added, defaults to true
  statusCode?: number; // status code to return, defaults by callback (success: 200, invalid: 400, notFound: 404, notAuthorized: 401, redirect: 302, error: 500)
  headers?: { [key: string]: any }; // custom headers to include
}

export interface CustomParameters {
  body?: any; // response body
  json?: boolean; // indicates if body should be JSON-stringified and content-type header set to application/json, defaults to true
  cors?: boolean; // indicates if CORS headers should be added, defaults to true
  statusCode: number; // status code to return, defaults by callback (success: 200, invalid: 400, notFound: 404, notAuthorized: 401, redirect: 302, error: 500)
  headers?: { [key: string]: any }; // custom headers to include
}

export interface ErrorParameters {
  body?: any; // response body
  json?: boolean; // indicates if body should be JSON-stringified and content-type header set to application/json, defaults to true
  cors?: boolean; // indicates if CORS headers should be added, defaults to true
  statusCode?: number; // status code to return, defaults to 500
  headers?: { [key: string]: any }; // custom headers to include
  err?: Error; // optional Error object for automatic logging
}

export interface RedirectParameters {
  url: string; // url to redirect to
  cors?: boolean; // indicates if CORS headers should be added, defaults to true
  statusCode?: number; // status code to return, defaults to 302
  headers?: { [key: string]: any }; // custom headers to include
}
