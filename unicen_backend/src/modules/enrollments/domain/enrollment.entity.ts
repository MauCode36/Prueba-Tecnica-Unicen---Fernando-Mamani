import { randomUUID } from "node:crypto";
import { EnrollmentAlreadyCancelledError } from "../../../shared/errors";
import { EnrollmentStatus } from "./enrollment-status.enum";

/**
 * Pure domain entity for Enrollment - free of framework and ORM dependencies.
 */
export class Enrollment {
  constructor(
    public readonly id: string,
    public readonly studentId: string,
    public readonly courseId: string,
    public status: EnrollmentStatus,
    public readonly createdAt: Date,
  ) {}

  /**
   * Builds a new active enrollment.
   * @param studentId - Student profile id.
   * @param courseId - Course id.
   * @returns A not yet persisted active enrollment.
   */
  static create(studentId: string, courseId: string): Enrollment {
    return new Enrollment(
      randomUUID(),
      studentId,
      courseId,
      EnrollmentStatus.ACTIVE,
      new Date(),
    );
  }

  /**
   * Whether the enrollment currently holds a seat.
   * @returns True when the status is ACTIVE.
   */
  get isActive(): boolean {
    return this.status === EnrollmentStatus.ACTIVE;
  }

  /**
   * Cancels the enrollment, releasing its seat.
   * @throws {EnrollmentAlreadyCancelledError} When it is already cancelled.
   */
  cancel(): void {
    if (!this.isActive) {
      throw new EnrollmentAlreadyCancelledError();
    }
    this.status = EnrollmentStatus.CANCELLED;
  }

  /**
   * Re-activates a cancelled enrollment (the student enrolls again).
   */
  reactivate(): void {
    this.status = EnrollmentStatus.ACTIVE;
  }
}
