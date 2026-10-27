import { QueryFailedError } from "typeorm";

const UNIQUE_VIOLATION = "23505";
const FOREIGN_KEY_VIOLATION = "23503";

/**
 * Reads the PostgreSQL error code of a failed query.
 * @param err - Any thrown value.
 * @returns The SQLSTATE code, or undefined when not a query failure.
 */
function getPostgresCode(err: unknown): string | undefined {
  if (!(err instanceof QueryFailedError)) return undefined;
  return (err.driverError as { code?: string } | undefined)?.code;
}

/**
 * Tells whether an error is a PostgreSQL unique constraint violation (23505).
 * @param err - Any thrown value.
 * @returns True for unique violations.
 */
export function isUniqueViolation(err: unknown): boolean {
  return getPostgresCode(err) === UNIQUE_VIOLATION;
}

/**
 * Tells whether an error is a PostgreSQL foreign key violation (23503).
 * @param err - Any thrown value.
 * @returns True for foreign key violations.
 */
export function isForeignKeyViolation(err: unknown): boolean {
  return getPostgresCode(err) === FOREIGN_KEY_VIOLATION;
}

/**
 * Reads the violated constraint name from a PostgreSQL query failure.
 * @param err - Any thrown value.
 * @returns The constraint name, or undefined when not available.
 */
export function getViolatedConstraint(err: unknown): string | undefined {
  if (!(err instanceof QueryFailedError)) return undefined;
  return (err.driverError as { constraint?: string } | undefined)?.constraint;
}
