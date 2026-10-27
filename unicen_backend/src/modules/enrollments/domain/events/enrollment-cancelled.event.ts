export const ENROLLMENT_CANCELLED = "enrollment.cancelled";

/**
 * Domain event emitted after an enrollment is cancelled.
 */
export class EnrollmentCancelledEvent {
  readonly occurredAt = new Date();

  constructor(
    public readonly enrollmentId: string,
    public readonly studentId: string,
    public readonly courseId: string,
  ) {}
}
