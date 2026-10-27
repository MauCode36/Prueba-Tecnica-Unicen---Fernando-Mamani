/**
 * Pure domain entity for Grade - free of framework and ORM dependencies.
 */
export class Grade {
  constructor(
    public readonly id: string,
    public readonly enrollmentId: string,
    public readonly value: number,
    public readonly recordedAt: Date,
  ) {}
}
