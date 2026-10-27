import { ArgumentsHost, HttpStatus } from "@nestjs/common";
import {
  CapacityBelowEnrollmentError,
  CourseHasEnrollmentsError,
  DomainError,
  DuplicateCourseError,
  DuplicateSubjectCodeError,
  InvalidCourseTeacherError,
  SubjectInUseError,
} from "../errors";
import { DomainExceptionFilter } from "./domain-exception.filter";

function run(error: DomainError): number {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const host = {
    switchToHttp: () => ({ getResponse: () => ({ status }) }),
  } as unknown as ArgumentsHost;

  new DomainExceptionFilter().catch(error, host);

  return status.mock.calls[0][0] as number;
}

describe("DomainExceptionFilter", () => {
  it("maps each E2 domain error code to its HTTP status", () => {
    expect(run(new DuplicateSubjectCodeError())).toBe(HttpStatus.CONFLICT);
    expect(run(new SubjectInUseError())).toBe(HttpStatus.CONFLICT);
    expect(run(new DuplicateCourseError())).toBe(HttpStatus.CONFLICT);
    expect(run(new CapacityBelowEnrollmentError(3))).toBe(HttpStatus.CONFLICT);
    expect(run(new CourseHasEnrollmentsError())).toBe(HttpStatus.CONFLICT);
    expect(run(new InvalidCourseTeacherError())).toBe(HttpStatus.BAD_REQUEST);
  });
});
