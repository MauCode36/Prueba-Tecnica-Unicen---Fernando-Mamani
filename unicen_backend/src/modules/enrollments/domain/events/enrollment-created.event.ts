export const ENROLLMENT_CREATED = "enrollment.created";

/**
 * Domain event emitted after a student is enrolled.
 */
export class EnrollmentCreatedEvent {
  readonly occurredAt = new Date();

  constructor(
    public readonly enrollmentId: string,
    public readonly studentId: string,
    public readonly courseId: string,
  ) {}
}
