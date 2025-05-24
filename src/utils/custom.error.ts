export class ConflictError extends Error {
  constructor(message = "Conflict Error!") {
    super(message);
    this.name = "ConflictError";
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends Error {
  constructor(message = "Not Found!") {
    super(message);
    this.name = "NotFoundError";
    Error.captureStackTrace(this, this.constructor);
  }
}

export class InvalidError extends Error {
  constructor(message = "Invalid!") {
    super(message);
    this.name = "InvalidError";
    Error.captureStackTrace(this, this.constructor);
  }
}
