import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  errors?: Record<string, string[]>;
  code?: string;
}

/**
 * Send a success response
 */
export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message: string = 'Success',
  statusCode: number = 200,
  meta?: ApiResponse['meta']
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta,
  };

  return res.status(statusCode).json(response);
};

/**
 * Send a created response (201)
 */
export const sendCreated = <T>(res: Response, data?: T, message: string = 'Resource created successfully'): Response => {
  return sendSuccess(res, data, message, 201);
};

/**
 * Send an error response
 */
export const sendError = (
  res: Response,
  message: string = 'Error',
  statusCode: number = 500,
  code: string = 'INTERNAL_ERROR',
  errors?: Record<string, string[]>
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    code,
    errors,
  };

  return res.status(statusCode).json(response);
};

/**
 * Send a paginated response
 */
export const sendPaginated = <T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  message: string = 'Data retrieved successfully'
): Response => {
  const totalPages = Math.ceil(total / limit);

  return sendSuccess(res, data, message, 200, {
    page,
    limit,
    total,
    totalPages,
  });
};

/**
 * Send a no content response (204)
 */
export const sendNoContent = (res: Response): Response => {
  return res.status(204).send();
};
