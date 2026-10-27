# AGENTS.md — Backend (UNICEN Academic System)

## Stack
- NestJS 11 + TypeScript (strict mode, no `any`), PostgreSQL 16, TypeORM with migrations (`synchronize: false`)
- Passport + JWT (`@nestjs/jwt`), bcrypt, `class-validator` / `class-transformer`
- `@nestjs/config` (env validated at startup), `@nestjs/swagger` (`/api/docs`), `@nestjs/event-emitter`
- Jest + Supertest for testing. Global prefix: `/api`

## Architecture: modular + pragmatic Clean Architecture
```
src/
├── config/          # env validation, typeorm config, data-source (CLI)
├── database/        # migrations/, seeds/
├── shared/          # guards/, decorators/, filters/, errors/, enums/
└── modules/
    ├── auth/  users/  subjects/  courses/  students/   # simple CRUD layers
    └── enrollments/  grades/                          # full Clean Architecture
```
**CRUD modules**: `controller → service → repository (TypeORM)` + `dto/`, `entities/`.

**Clean modules** (business rules live here):
```
<module>/
├── domain/          # entities, repository interfaces (ports), domain errors, strategies
├── application/     # use cases (one class per use case, single `execute()` method)
├── infrastructure/  # TypeORM repositories (adapters), ORM entities, listeners
└── presentation/    # controllers, DTOs
```
- Dependencies point inward: `domain/` never imports NestJS, TypeORM or anything outside `domain/`.
- Repositories are injected by token: `{ provide: ENROLLMENT_REPOSITORY, useClass: TypeOrmEnrollmentRepository }`.
- Controllers are thin: validate DTO → call a use case or service → return. No business logic.
- Cross-module communication goes through exported providers or domain events, never through another module's repository.

## Design patterns (keep coherent with README)
- **Repository**: decouples the domain from TypeORM.
- **Strategy**: final grade calculation (`GradeCalculationStrategy`: weighted, simple average).
- **Observer**: domain events (`enrollment.created`, `grade.recorded`) handled by an audit listener.
- **Adapter/Factory**: `TokenService` interface with a `JwtTokenService` implementation (swappable for PASETO).

## Business rules
- Enrollment: course exists, available seats (`active enrollments < maxCapacity`), no duplicate (student + course).
  Run inside a transaction with `SELECT ... FOR UPDATE` on the course; the DB `UNIQUE` constraint is the backup.
- Grades: only the course's assigned teacher can record them; value between 0 and 100.
- Academic history: students see only their own; admins see any.
- Domain errors extend `DomainError` and are mapped to HTTP by `DomainExceptionFilter`
  (`CourseFullError`/`DuplicateEnrollmentError` → 409, `ForbiddenActionError` → 403, `NotFoundError` → 404).

## Auth & roles
- Global `JwtAuthGuard`; `@Public()` for open routes. `RolesGuard` + `@Roles(Role.ADMIN, ...)`.
- `@CurrentUser()` to read the authenticated user. Token payload: `{ sub, role }`.
- Roles: `ADMIN`, `TEACHER`, `STUDENT`.

## Language
- Everything in **English**: folders, files, classes, variables, DB tables/columns, comments, JSDoc.
- Only API error messages shown to end users may be in Spanish.

## JSDoc (mandatory)
Every class, public method, use case, controller endpoint and exported function has JSDoc:
```ts
/**
 * Enrolls a student in a course, validating capacity and duplicates.
 * @param input - Student and course identifiers.
 * @returns The created enrollment.
 * @throws {CourseFullError} When the course has no available seats.
 * @throws {DuplicateEnrollmentError} When the student is already enrolled.
 */
```
Controllers also use Swagger decorators (`@ApiTags`, `@ApiOperation`, `@ApiResponse`).

## Naming conventions
| Element | Convention | Example |
|---|---|---|
| Folders | kebab-case, plural modules | `enrollments/` |
| Files | kebab-case + type suffix | `enroll-student.use-case.ts`, `courses.controller.ts` |
| Classes | PascalCase + suffix | `EnrollStudentUseCase`, `CreateCourseDto` |
| Interfaces | PascalCase, no `I` prefix | `EnrollmentRepository` |
| Injection tokens | UPPER_SNAKE_CASE | `ENROLLMENT_REPOSITORY` |
| Enums | PascalCase, UPPER_CASE members | `Role.TEACHER` |
| DB tables / columns | snake_case, plural tables | `enrollments.course_id` |
| Events | `entity.past-tense` | `grade.recorded` |
| Routes | kebab-case, plural nouns | `/api/courses/:id/enrolled-students` |

## Code rules
- Files: **max 600 lines**; methods: max ~50 lines. Split when exceeded.
- UUID primary keys, `created_at` / `updated_at` timestamps.
- Global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`); every input has a DTO.
- Never return entities with `password_hash`; map to response DTOs.
- Config only via `ConfigService`; no `process.env` in business code.

## Testing
- **Unit (mandatory for use cases and strategies)**: `*.spec.ts` next to the file; mock repositories
  via their interfaces. Cover happy path + each domain error (course full, duplicate, forbidden).
- **E2E** (`test/*.e2e-spec.ts`, Supertest): login, enrollment flow, grade recording per role.
- Arrange-Act-Assert; test names describe behavior: `it('throws CourseFullError when no seats left')`.

## Technical Decisions
- Check and add technical decisiones in /docs/decisions.md

## Important
- If an installed skill conflicts with this file, this file takes precedence.

## Before finishing a task
- `npm run lint`, `npm run build` and `npm test` pass.
- Schema changes come with a migration (`npm run migration:generate`).
- New code has JSDoc and tests where required; no file exceeds its limit.
- Conventional Commits: `feat(enrollments): validate course capacity`.