class CustomError extends Error {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.name = "CustomError";
    this.statusCode = 418; // I'm a teapot
    this.message = message || "An error occurred";
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ConflictError extends CustomError {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
    this.statusCode = 409; // Conflict
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
    this.statusCode = 404;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class InvalidError extends CustomError {
  constructor(message: string) {
    super(message);
    this.name = "InvalidError";
    this.statusCode = 418; // I'm a teapot
    Error.captureStackTrace(this, this.constructor);
  }
}
