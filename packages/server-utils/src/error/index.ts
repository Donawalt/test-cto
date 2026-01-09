export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export function createError(
  code: string,
  message: string,
  statusCode: number = 500,
  details?: unknown
): AppError {
  return new AppError(code, message, statusCode, details);
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export type AsyncFunction<T = unknown> = (...args: unknown[]) => Promise<T>;

export function asyncHandler<T>(fn: AsyncFunction<T>) {
  return async (...args: unknown[]): Promise<T> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (isAppError(error)) {
        throw error;
      }
      
      throw createError(
        'INTERNAL_ERROR',
        error instanceof Error ? error.message : 'An unexpected error occurred',
        500,
        error
      );
    }
  };
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    details?: unknown;
  };
}

export function errorFormatter(error: unknown): ErrorResponse {
  if (isAppError(error)) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
        details: error.details,
      },
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message,
        statusCode: 500,
      },
    };
  }

  return {
    success: false,
    error: {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
      statusCode: 500,
      details: error,
    },
  };
}

export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  BAD_REQUEST: 'BAD_REQUEST',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;

export function createValidationError(message: string, details?: unknown): AppError {
  return createError(ErrorCodes.VALIDATION_ERROR, message, 400, details);
}

export function createAuthenticationError(message: string = 'Authentication required'): AppError {
  return createError(ErrorCodes.AUTHENTICATION_ERROR, message, 401);
}

export function createAuthorizationError(message: string = 'Insufficient permissions'): AppError {
  return createError(ErrorCodes.AUTHORIZATION_ERROR, message, 403);
}

export function createNotFoundError(resource: string): AppError {
  return createError(ErrorCodes.NOT_FOUND, `${resource} not found`, 404);
}

export function createConflictError(message: string): AppError {
  return createError(ErrorCodes.CONFLICT, message, 409);
}
