// MARK: - Superclass
export class CustomError extends Error {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.name = 'CustomError';
    this.statusCode = 418; // I'm a teapot
    this.message = message || 'An error occurred';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class TeapotError extends CustomError {
  constructor(message: string) {
    super(message);
    this.name = 'TeapotError';
    this.statusCode = 418; // I'm a teapot
    Error.captureStackTrace(this, this.constructor);
  }
}

// MARK: - Subclasses
export class ConflictError extends CustomError {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409; // Conflict
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class InvalidError extends CustomError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidError';
    this.statusCode = 418; // I'm a teapot
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ServerError extends CustomError {
  constructor(message: string) {
    super(message);
    this.name = 'ServerError';
    this.statusCode = 500; // Internal Server Error
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = 403; // Unauthorized
    Error.captureStackTrace(this, this.constructor);
  }
}
