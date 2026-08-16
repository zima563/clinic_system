export default class ApiError extends Error {
  statusCode: number;
  httpCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.httpCode = statusCode;
  }
}
