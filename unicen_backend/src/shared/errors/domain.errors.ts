/**
 * Base domain error class.
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when a course has reached its maximum enrollment capacity.
 */
export class CourseFullError extends DomainError {
  readonly code = "COURSE_FULL";

  constructor(message = "El curso no tiene cupos disponibles") {
    super(message);
  }
}

/**
 * Thrown when a student is already enrolled in a course.
 */
export class DuplicateEnrollmentError extends DomainError {
  readonly code = "DUPLICATE_ENROLLMENT";

  constructor(
    message = "El estudiante ya se encuentra inscrito en este curso",
  ) {
    super(message);
  }
}

/**
 * Thrown when login credentials are invalid or the account is inactive.
 */
export class InvalidCredentialsError extends DomainError {
  readonly code = "INVALID_CREDENTIALS";

  constructor(message = "Credenciales inválidas") {
    super(message);
  }
}

/**
 * Thrown when attempting to register a user with an already existing email.
 */
export class DuplicateUserEmailError extends DomainError {
  readonly code = "DUPLICATE_USER_EMAIL";

  constructor(message = "El correo electrónico ya se encuentra registrado") {
    super(message);
  }
}

/**
 * Thrown when a requested entity is not found.
 */
export class NotFoundError extends DomainError {
  readonly code = "NOT_FOUND";

  constructor(message = "Entidad no encontrada") {
    super(message);
  }
}

/**
 * Thrown when an action is forbidden for the given user/role.
 */
export class ForbiddenActionError extends DomainError {
  readonly code = "FORBIDDEN_ACTION";

  constructor(message = "Acción no permitida") {
    super(message);
  }
}

/**
 * Thrown when a subject code is already used by another subject.
 */
export class DuplicateSubjectCodeError extends DomainError {
  readonly code = "DUPLICATE_SUBJECT_CODE";

  constructor(message = "Ya existe una materia con ese código") {
    super(message);
  }
}

/**
 * Thrown when deleting a subject that still has courses.
 */
export class SubjectInUseError extends DomainError {
  readonly code = "SUBJECT_IN_USE";

  constructor(
    message = "No se puede eliminar una materia con cursos asociados",
  ) {
    super(message);
  }
}

/**
 * Thrown when a (subject, term, section) course already exists.
 */
export class DuplicateCourseError extends DomainError {
  readonly code = "DUPLICATE_COURSE";

  constructor(
    message = "Ya existe ese paralelo para la materia en esta gestión",
  ) {
    super(message);
  }
}

/**
 * Thrown when the user assigned as course teacher is not an active teacher.
 */
export class InvalidCourseTeacherError extends DomainError {
  readonly code = "INVALID_COURSE_TEACHER";

  constructor(message = "El docente asignado debe tener rol docente") {
    super(message);
  }
}

/**
 * Thrown when lowering a course capacity below its active enrollments.
 */
export class CapacityBelowEnrollmentError extends DomainError {
  readonly code = "CAPACITY_BELOW_ENROLLMENT";

  constructor(enrolled: number) {
    super(`El cupo no puede ser menor a los inscritos actuales (${enrolled})`);
  }
}

/**
 * Thrown when deleting a course that has enrollments.
 */
export class CourseHasEnrollmentsError extends DomainError {
  readonly code = "COURSE_HAS_ENROLLMENTS";

  constructor(message = "No se puede eliminar un curso con inscripciones") {
    super(message);
  }
}
