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

---

## Decisiones pendientes
- [ ] Implementar `PasetoTokenService` si sobra tiempo o si se confirma que PASETO es obligatorio.
- [ ] Paginación y filtros en los listados (cursos por gestión ya está contemplado).
- [ ] Definir los tipos de nota y sus ponderaciones por defecto (`PARTIAL_1`, `PARTIAL_2`, `FINAL`).