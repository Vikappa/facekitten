/**
 * API Response Utility
 * Standardized API response formats
 */

interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  statusCode: number
}

/**
 * Creates a success response
 */
export function successResponse<T>(
  data: T,
  message: string = 'Success',
  statusCode: number = 200
): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    statusCode,
  }
}

/**
 * Creates an error response
 */
export function errorResponse(
  error: string,
  statusCode: number = 500
): ApiResponse {
  return {
    success: false,
    error,
    statusCode,
  }
}

/**
 * Creates a not found response
 */
export function notFoundResponse(message: string = 'Resource not found') {
  return errorResponse(message, 404)
}

/**
 * Creates a validation error response
 */
export function validationErrorResponse(message: string = 'Validation failed') {
  return errorResponse(message, 400)
}

/**
 * Creates an unauthorized response
 */
export function unauthorizedResponse(
  message: string = 'Unauthorized access'
) {
  return errorResponse(message, 401)
}
