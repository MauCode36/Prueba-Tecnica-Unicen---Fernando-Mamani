import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import {
  CourseFullError,
  DomainError,
  DuplicateEnrollmentError,
  DuplicateUserEmailError,
  ForbiddenActionError,
  InvalidCredentialsError,
  NotFoundError,
} from "../errors";

/**
 * Filter that maps domain errors to standard HTTP responses.
 */
@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  /**
   * Translates a domain error into the `{ statusCode, message, error }` contract.
   * @param exception - The thrown domain error.
   * @param host - Arguments host of the current request.
   */
  catch(exception: DomainError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.BAD_REQUEST;

    if (
      exception instanceof CourseFullError ||
      exception instanceof DuplicateEnrollmentError ||
      exception instanceof DuplicateUserEmailError
    ) {
      status = HttpStatus.CONFLICT;
    } else if (exception instanceof InvalidCredentialsError) {
      status = HttpStatus.UNAUTHORIZED;
    } else if (exception instanceof ForbiddenActionError) {
      status = HttpStatus.FORBIDDEN;
    } else if (exception instanceof NotFoundError) {
      status = HttpStatus.NOT_FOUND;
    }

    response.status(status).json({
      statusCode: status,
      error: exception.code,
      message: exception.message,
      timestamp: new Date().toISOString(),
    });
  }
}
