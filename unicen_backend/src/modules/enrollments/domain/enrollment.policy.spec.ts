import {
  CourseFullError,
  DuplicateEnrollmentError,
} from "../../../shared/errors";
import { Enrollment } from "./enrollment.entity";
import { EnrollmentPolicy } from "./enrollment.policy";

describe("EnrollmentPolicy", () => {
  it("allows enrollment when seats are available and there is no previous enrollment", () => {
    expect(() =>
      EnrollmentPolicy.assertCanEnroll({
        activeCount: 1,
        maxCapacity: 2,
        existing: null,
      }),
    ).not.toThrow();
  });

  it("throws CourseFullError when active enrollments reach maxCapacity", () => {
    expect(() =>
      EnrollmentPolicy.assertCanEnroll({
        activeCount: 2,
        maxCapacity: 2,
        existing: null,
      }),
    ).toThrow(CourseFullError);
  });

  it("throws DuplicateEnrollmentError when an active enrollment already exists", () => {
    expect(() =>
      EnrollmentPolicy.assertCanEnroll({
        activeCount: 1,
        maxCapacity: 5,
        existing: Enrollment.create("s1", "c1"),
      }),
    ).toThrow(DuplicateEnrollmentError);
  });

  it("checks duplicate before capacity", () => {
    expect(() =>
      EnrollmentPolicy.assertCanEnroll({
        activeCount: 5,
        maxCapacity: 5,
        existing: Enrollment.create("s1", "c1"),
      }),
    ).toThrow(DuplicateEnrollmentError);
  });

  it("allows re-enrollment when the previous enrollment is cancelled", () => {
    const previous = Enrollment.create("s1", "c1");
    previous.cancel();

    expect(() =>
      EnrollmentPolicy.assertCanEnroll({
        activeCount: 0,
        maxCapacity: 5,
        existing: previous,
      }),
    ).not.toThrow();
  });
});
