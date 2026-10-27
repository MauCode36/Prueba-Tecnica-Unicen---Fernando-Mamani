# Decisiones técnicas del Backend

Registro vivo de las decisiones técnicas del backend (formato ADR liviano). Las entradas nuevas se agregan al final y las anteriores no se reescriben: si una decisión cambia, se añade una entrada nueva que la reemplaza.

**Formato:** contexto → decisión → justificación → consecuencias.

---

## BD-001 — NestJS + TypeScript como framework de la API
- **Fecha:** 2026-10-27
- **Contexto:** El enunciado sugiere NestJS, y el sistema necesita módulos bien delimitados, autenticación por roles y validación de entradas.
- **Decisión:** API REST con NestJS 11 y TypeScript en modo estricto, con el prefijo global `/api`.
- **Justificación:** Su inyección de dependencias, sus módulos, guards, pipes y filtros facilitan aplicar arquitectura por capas o Clean Architecture sin librerías adicionales.
- **Consecuencias:** Toda la lógica de negocio vive en el backend; el frontend solo consume la API.

## BD-002 — Arquitectura modular con Clean Architecture pragmática
- **Fecha:** 2026-10-27
- **Contexto:** Algunos módulos son CRUD simples (materias, cursos, estudiantes), mientras que otros concentran reglas de negocio (inscripciones, notas).
- **Decisión:**
  - Módulos CRUD (`users`, `subjects`, `courses`, `students`): capas simples `controller → service → repository`.
  - Módulos con reglas de negocio (`enrollments`, `grades`): Clean Architecture completa con `domain/`, `application/`, `infrastructure/` y `presentation/`.
- **Justificación:** Se aplica Clean Architecture donde aporta valor (reglas aisladas del framework y testeables) y se evita la sobreingeniería en los módulos que solo persisten datos.
- **Consecuencias:** Las dependencias apuntan hacia adentro: `domain/` no importa NestJS ni TypeORM. Los controllers son delgados y delegan en casos de uso o services.

## BD-003 — Patrón Repository con inyección por token
- **Fecha:** 2026-10-27
- **Decisión:** El dominio define interfaces de repositorio (puertos) y la infraestructura las implementa con TypeORM (adaptadores). Se registran por token: `{ provide: ENROLLMENT_REPOSITORY, useClass: TypeOrmEnrollmentRepository }`.
- **Justificación:** Desacopla las reglas de negocio de la persistencia y permite probar los casos de uso con repositorios simulados.
- **Consecuencias:** Hay que mapear entre las entidades de dominio y las entidades ORM.

## BD-004 — Casos de uso como clases con un solo método `execute()`
- **Fecha:** 2026-10-27
- **Decisión:** Cada operación de negocio es una clase (`EnrollStudentUseCase`, `RecordGradeUseCase`, `GetAcademicHistoryUseCase`).
- **Justificación:** Responsabilidad única, nombres que expresan la intención del negocio y tests unitarios focalizados.

## BD-005 — Validación de cupo y de inscripción duplicada con transacción y lock
- **Fecha:** 2026-10-27
- **Contexto:** Dos inscripciones simultáneas al último cupo podrían provocar sobrecupo.
- **Decisión:** El caso de uso de inscripción se ejecuta dentro de una transacción con `SELECT ... FOR UPDATE` sobre el curso, cuenta las inscripciones activas y verifica que no exista una para el mismo estudiante y curso. La restricción `UNIQUE (student_id, course_id)` en la base de datos actúa como respaldo.
- **Justificación:** Garantiza la consistencia ante concurrencia sin depender solo de validaciones en memoria.
- **Consecuencias:** Los errores de dominio `CourseFullError` y `DuplicateEnrollmentError` se traducen a `409 Conflict`.

## BD-006 — Patrón Strategy para el cálculo de la nota final
- **Fecha:** 2026-10-27
- **Decisión:** La interfaz `GradeCalculationStrategy` tiene implementaciones para el promedio ponderado (por defecto) y el promedio simple.
- **Justificación:** La forma de calcular la nota puede variar según el reglamento o la materia; se agregan nuevas estrategias sin modificar el caso de uso (principio abierto/cerrado).

## BD-007 — Patrón Observer con eventos de dominio
- **Fecha:** 2026-10-27
- **Decisión:** Se usa `@nestjs/event-emitter` para emitir `enrollment.created` y `grade.recorded`, que escucha un listener de auditoría.
- **Justificación:** Los efectos secundarios (auditoría y, a futuro, notificaciones) quedan desacoplados del flujo principal y de otros módulos.
- **Consecuencias:** Los listeners no deben contener reglas de negocio críticas; si fallan, no revierten la operación principal.

## BD-008 — Autenticación JWT detrás de una abstracción `TokenService`
- **Fecha:** 2026-10-27
- **Contexto:** El enunciado menciona "passeto jwt"; no queda claro si se exige PASETO.
- **Decisión:** Autenticación con Passport y JWT, encapsulada en la interfaz `TokenService` con la implementación `JwtTokenService` (patrón Adapter/Factory). Contraseñas con hash bcrypt. Payload `{ sub, role }` con expiración de 8 h.
- **Justificación:** Se puede incorporar `PasetoTokenService` sin tocar los casos de uso ni los guards.
- **Consecuencias:** `JwtAuthGuard` es global; las rutas abiertas usan `@Public()`.

## BD-009 — Autorización por roles con guards y decoradores
- **Fecha:** 2026-10-27
- **Decisión:** `RolesGuard` junto con `@Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)` y `@CurrentUser()`. Las reglas que dependen del recurso (por ejemplo, que solo el docente del curso registre notas, o que el estudiante vea únicamente su historial) se validan en los casos de uso.
- **Justificación:** Los guards resuelven el acceso por rol; la propiedad del recurso es una regla de negocio y por eso vive en el dominio o la aplicación.

## BD-010 — PostgreSQL + TypeORM con migraciones
- **Fecha:** 2026-10-27
- **Decisión:** PostgreSQL 16 con TypeORM, `synchronize: false` y migraciones versionadas. Claves primarias UUID, timestamps `created_at`/`updated_at` y tablas y columnas en snake_case.
- **Justificación:** El esquema es reproducible y auditable; las migraciones dejan registrada la evolución de la base de datos. TypeORM se integra de forma nativa con NestJS.
- **Consecuencias:** Un seed inicial crea usuarios de cada rol, materias y cursos de ejemplo para la evaluación.

## BD-011 — Errores de dominio traducidos por un filtro global
- **Fecha:** 2026-10-27
- **Decisión:** Los errores de dominio extienden `DomainError` y `DomainExceptionFilter` los mapea a HTTP (`409`, `403`, `404`) con una respuesta uniforme `{ statusCode, message, error }`.
- **Justificación:** El dominio no conoce HTTP, y el cliente recibe errores consistentes que puede mostrar directamente.

## BD-012 — Validación de entradas y documentación con Swagger
- **Fecha:** 2026-10-27
- **Decisión:** `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`), DTOs con `class-validator` y documentación OpenAPI en `/api/docs`. Las respuestas nunca exponen `password_hash`.
- **Justificación:** La entrada se valida en el borde del sistema y el contrato queda documentado para el frontend y para los evaluadores.

## BD-013 — Estrategia de testing
- **Fecha:** 2026-10-27
- **Decisión:** Tests unitarios con Jest, obligatorios para casos de uso y estrategias, con repositorios simulados a partir de sus interfaces, cubriendo el camino feliz y cada error de dominio. Tests e2e con Supertest para el login, la inscripción y el registro de notas por rol.
- **Justificación:** Las reglas de negocio son lo más crítico y lo que la arquitectura permite probar de forma aislada.

## BD-014 — Convenciones de código definidas en AGENTS.md
- **Fecha:** 2026-10-27
- **Decisión:** Código, carpetas, base de datos y JSDoc en inglés; JSDoc obligatorio; archivos de hasta 600 líneas; convenciones de nombrado explícitas; Conventional Commits.
- **Justificación:** Legibilidad para personas y agentes de IA, y consistencia en el código generado con asistencia de IA.

## BD-015 — Contenedores con Docker Compose
- **Fecha:** 2026-10-27
- **Decisión:** Dockerfile multi-stage (`node:22-alpine`). Al iniciar, se ejecutan las migraciones, luego el seed (si no hay datos) y finalmente `start:prod`. En el compose, la API depende de la base de datos con `condition: service_healthy` (healthcheck con `pg_isready`).
- **Justificación:** `docker compose up` levanta un entorno funcional y con datos de prueba sin pasos manuales.

## BD-016 — Integridad referencial para borrados
- **Fecha:** 2026-10-27
- **Contexto:** No se deben borrar materias con cursos ni cursos con inscripciones, y `subjects` no puede depender de `courses` (dependencia circular de módulos).
- **Decisión:** `ON DELETE RESTRICT` en `courses.subject_id` y `enrollments.course_id`. El service traduce el error `23503` de PostgreSQL a `SubjectInUseError` / `CourseHasEnrollmentsError` (`409`).
- **Justificación:** La base de datos garantiza la regla incluso ante concurrencia y los módulos quedan desacoplados.

## BD-017 — Proyección de lectura de cupos
- **Fecha:** 2026-10-27
- **Decisión:** `courses` calcula `enrolledCount`, `availableSeats` e `isEnrolled` con subconsultas SQL sobre `enrollments` en un solo query (`CoursesQueryBuilder`), sin N+1. Las escrituras de inscripciones siguen siendo exclusivas del módulo `enrollments`.
- **Consecuencias:** `isEnrolled` se resuelve por `students.user_id` a partir del `sub` del token; es `false` si el usuario no tiene perfil de estudiante.

## BD-018 — `enrollments.student_id` apunta al perfil `students.id`
- **Fecha:** 2026-10-27
- **Decisión:** La inscripción pertenece al perfil académico (`student_code`, `program`), no a la cuenta. `students.user_id` (único) enlaza el perfil con `users`. E2 adelanta las tablas `students` y `enrollments` en su migración; HU-09 y E3 agregan la lógica sin reescribirla. `enrollments` pasa de `enrollment_date` a `created_at`/`updated_at` más `status` (`ACTIVE`/`CANCELLED`).

## BD-019 — Mapa `code → HttpStatus` en `DomainExceptionFilter`
- **Fecha:** 2026-10-27
- **Decisión:** Se reemplaza la cadena de `instanceof` por un mapa de códigos de error a estados HTTP, con `400` por defecto. Cada error nuevo suma una línea al mapa.

## BD-020 — Transacción encapsulada en el puerto `EnrollmentRepository.withLockedCourse`
- **Fecha:** 2026-10-27
- **Decisión:** El caso de uso de inscripción solo ve un callback con operaciones del dominio (`countActive`, `findByStudent`, `save`). El adaptador abre la transacción y toma el lock con `CoursesService.lockForEnrollment(id, manager)` (provider exportado), que usa el mismo `pessimistic_write` que `CoursesService.update()`.
- **Justificación:** El dominio no conoce `EntityManager`, y las inscripciones y la edición de cupo se serializan sobre la misma fila del curso (BD-005).

## BD-021 — La reinscripción reactiva la fila `CANCELLED`
- **Fecha:** 2026-10-27
- **Decisión:** Si el estudiante ya tuvo una inscripción cancelada en el curso, se reactiva en lugar de insertar otra fila.
- **Justificación:** `UNIQUE (student_id, course_id)` no admite una segunda fila; el historial queda en `updated_at`.

## BD-022 — Los estudiantes se crean solo vía `/api/students`
- **Fecha:** 2026-10-27
- **Decisión:** `POST /api/users` usa `CreateStaffUserDto` y rechaza `role = STUDENT` (`400`). `UsersService.create` interno sigue aceptándolo para que lo use `students`, que crea usuario y perfil en una sola transacción.
- **Justificación:** Garantiza que todo usuario STUDENT tiene perfil y puede inscribirse.

## BD-023 — Desactivar un estudiante no cancela sus inscripciones
- **Fecha:** 2026-10-27
- **Decisión:** Desactivar bloquea el login (`LoginUseCase`) y las nuevas inscripciones (`InactiveStudentError`); las cancelaciones son explícitas.

## BD-024 — Los errores de inscripción viven en `shared/errors`
- **Fecha:** 2026-10-27
- **Decisión:** Se agregan junto al resto para mantener un único mapa `code → HttpStatus` (BD-019). `domain/` los importa desde `shared/errors`, que no depende de ningún framework.

## BD-025 — Puerto `EnrollmentGradesChecker` con implementación interina
- **Fecha:** 2026-10-27
- **Decisión:** La regla "no cancelar con notas" queda detrás del puerto; `PendingGradesChecker` devuelve `false` porque `grades` aún no existe. E4 cambia solo el binding del módulo por una implementación SQL.

## BD-026 — El id de una inscripción nueva se genera en el dominio
- **Fecha:** 2026-10-27
- **Decisión:** `Enrollment.create()` genera el UUID con `node:crypto` en lugar de dejarlo a la base.
- **Justificación:** Mantiene `Enrollment.id` como `string` (sin `null`) y permite que el repositorio use un único `save` para insertar o actualizar. `domain/` sigue sin importar NestJS ni TypeORM.

---

## Decisiones pendientes
- [ ] Implementar `PasetoTokenService` si sobra tiempo o si se confirma que PASETO es obligatorio.
- [ ] Paginación y filtros en los listados (cursos por gestión ya está contemplado).
- [ ] Definir los tipos de nota y sus ponderaciones por defecto (`PARTIAL_1`, `PARTIAL_2`, `FINAL`).