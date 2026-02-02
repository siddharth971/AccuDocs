export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code: string;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// Predefined error types
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad Request', code: string = 'BAD_REQUEST') {
    super(message, 400, code);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', code: string = 'UNAUTHORIZED') {
    super(message, 401, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', code: string = 'FORBIDDEN') {
    super(message, 403, code);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource Not Found', code: string = 'NOT_FOUND') {
    super(message, 404, code);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict', code: string = 'CONFLICT') {
    super(message, 409, code);
  }
}

export class ValidationError extends AppError {
  public readonly errors: Record<string, string[]>;

  constructor(message: string = 'Validation Error', errors: Record<string, string[]> = {}) {
    super(message, 422, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string = 'Too Many Requests', code: string = 'RATE_LIMIT_EXCEEDED') {
    super(message, 429, code);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal Server Error', code: string = 'INTERNAL_ERROR') {
    super(message, 500, code, false);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service Unavailable', code: string = 'SERVICE_UNAVAILABLE') {
    super(message, 503, code);
  }
}
