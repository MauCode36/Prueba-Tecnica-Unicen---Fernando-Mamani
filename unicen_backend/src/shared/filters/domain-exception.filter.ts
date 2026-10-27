import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { DomainError } from "../errors";

/**
 * HTTP status per domain error code; unmapped codes default to 400.
 */
export const STATUS_BY_CODE: Readonly<Record<string, HttpStatus>> = {
  COURSE_FULL: HttpStatus.CONFLICT,
  DUPLICATE_ENROLLMENT: HttpStatus.CONFLICT,
  DUPLICATE_USER_EMAIL: HttpStatus.CONFLICT,
  DUPLICATE_SUBJECT_CODE: HttpStatus.CONFLICT,
  SUBJECT_IN_USE: HttpStatus.CONFLICT,
  DUPLICATE_COURSE: HttpStatus.CONFLICT,
  CAPACITY_BELOW_ENROLLMENT: HttpStatus.CONFLICT,
  COURSE_HAS_ENROLLMENTS: HttpStatus.CONFLICT,
  INVALID_CREDENTIALS: HttpStatus.UNAUTHORIZED,
  FORBIDDEN_ACTION: HttpStatus.FORBIDDEN,
  NOT_FOUND: HttpStatus.NOT_FOUND,
};

/**
 * Filter that maps domain errors to standard HTTP responses.
 */
@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  /**
   * Translates a domain error into the `{ statusCode, error, message, timestamp }` contract.
   * @param exception - The thrown domain error.
   * @param host - Arguments host of the current request.
   */
  catch(exception: DomainError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const status = STATUS_BY_CODE[exception.code] ?? HttpStatus.BAD_REQUEST;

    response.status(status).json({
      statusCode: status,
      error: exception.code,
      message: exception.message,
      timestamp: new Date().toISOString(),
    });
  }
}
