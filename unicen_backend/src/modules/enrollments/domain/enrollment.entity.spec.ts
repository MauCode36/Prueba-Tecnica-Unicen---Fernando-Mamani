import { EnrollmentAlreadyCancelledError } from "../../../shared/errors";
import { EnrollmentStatus } from "./enrollment-status.enum";
import { Enrollment } from "./enrollment.entity";

describe("Enrollment", () => {
  it("cancels an active enrollment", () => {
    const enrollment = Enrollment.create("s1", "c1");

    enrollment.cancel();

    expect(enrollment.status).toBe(EnrollmentStatus.CANCELLED);
    expect(enrollment.isActive).toBe(false);
  });

  it("throws EnrollmentAlreadyCancelledError when cancelling twice", () => {
    const enrollment = Enrollment.create("s1", "c1");
    enrollment.cancel();

    expect(() => enrollment.cancel()).toThrow(EnrollmentAlreadyCancelledError);
  });

  it("reactivates a cancelled enrollment", () => {
    const enrollment = Enrollment.create("s1", "c1");
    enrollment.cancel();

    enrollment.reactivate();

    expect(enrollment.isActive).toBe(true);
  });
});
