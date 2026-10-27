/**
 * Pure domain entity for Enrollment - free of framework and ORM dependencies.
 */
export class Enrollment {
  constructor(
    public readonly id: string,
    public readonly studentId: string,
    public readonly courseId: string,
    public readonly enrollmentDate: Date,
  ) {}
}
