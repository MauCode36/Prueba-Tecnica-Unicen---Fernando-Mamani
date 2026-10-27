# Historias de usuario y features — Sistema Académico UNICEN

Desglose del enunciado en épicas, features e historias de usuario con criterios de aceptación.

**Prioridad (MoSCoW):** 🔴 Must (obligatorio para la entrega) · 🟡 Should (si hay tiempo) · ⚪ Could (extra).
**Roles:** `ADMIN` (administrador), `TEACHER` (docente), `STUDENT` (estudiante).

---

## E0 — Infraestructura y base del proyecto

| ID | Feature | Prioridad |
|---|---|---|
| F0.1 | `docker compose up` levanta `db`, `api` y `web` | 🔴 |
| F0.2 | Migraciones + seed con un usuario por rol, materias y cursos de ejemplo | 🔴 |
| F0.3 | Swagger en `/api/docs` | 🟡 |
| F0.4 | README con decisiones y patrones + diagrama de arquitectura | 🔴 |

**Criterios de aceptación**
- Con el repo recién clonado, `docker compose up --build` deja la web en `http://localhost` y la API en `/api`, sin pasos manuales.
- La API espera a que la base de datos esté saludable (healthcheck) antes de arrancar.
- El seed es idempotente: no duplica datos al reiniciar.
- Las credenciales de prueba de cada rol están documentadas en el README.

---

## E1 — Autenticación y roles

### HU-01 · Iniciar sesión 🔴
**Como** usuario del sistema **quiero** iniciar sesión con email y contraseña **para** acceder a las funciones de mi rol.
- `POST /api/auth/login` devuelve `{ accessToken, user: { id, name, email, role } }`.
- Las credenciales inválidas devuelven `401` con un mensaje genérico (sin revelar si el email existe).
- Las contraseñas se guardan con hash bcrypt; nunca se devuelven en la respuesta.
- El front guarda el token y redirige al inicio correspondiente al rol.

### HU-02 · Proteger el acceso por rol 🔴
**Como** sistema **quiero** restringir cada endpoint y pantalla según el rol **para** que nadie acceda a funciones que no le corresponden.
- Toda ruta de la API requiere token salvo `@Public()` (login).
- Sin token o con token vencido → `401`; con un rol no permitido → `403`.
- En el front, sin sesión se redirige a `/login`, y con un rol no permitido, a `/403`.
- El menú lateral muestra solo las opciones del rol.

### HU-03 · Cerrar sesión y ver mi perfil 🔴
**Como** usuario **quiero** cerrar sesión y ver mis datos **para** controlar mi sesión.
- `GET /api/auth/me` devuelve el usuario autenticado.
- Al cerrar sesión se elimina el token y se redirige a `/login`. Un `401` de la API también cierra la sesión.

### HU-04 · Gestionar usuarios 🟡
**Como** ADMIN **quiero** crear usuarios con rol (docentes y administradores) **para** dar acceso al sistema.
- El email es único (`409` si ya existe). El rol es obligatorio.

### HU-19 · Token PASETO ⚪
**Como** equipo técnico **queremos** poder emitir tokens PASETO **para** cumplir el enunciado si lo exige.
- `PasetoTokenService` implementa `TokenService`; se cambia por configuración sin tocar los casos de uso.

---

## E2 — Materias y cursos

### HU-05 · Gestionar el catálogo de materias 🔴
**Como** ADMIN **quiero** crear, editar, listar y eliminar materias **para** mantener el catálogo académico.
- Campos: `code` (único), `name`, `credits` (> 0).
- Código duplicado → `409`. Listar está disponible para cualquier usuario autenticado.
- No se puede eliminar una materia que tenga cursos asociados (`409`).

### HU-06 · Gestionar la oferta de cursos por gestión 🔴
**Como** ADMIN **quiero** abrir cursos de una materia en una gestión **para** ofertarlos a los estudiantes.
- Campos: `subjectId`, `term` (formato `YYYY-1` o `YYYY-2`), `section` (paralelo), `teacherId`, `maxCapacity` (> 0).
- La combinación `(subject, term, section)` es única (`409`).
- El docente asignado debe tener rol `TEACHER`.
- No se puede reducir `maxCapacity` por debajo de los inscritos actuales.

### HU-07 · Consultar la oferta de cursos 🔴
**Como** STUDENT **quiero** ver los cursos disponibles de una gestión **para** decidir a cuáles inscribirme.
- `GET /api/courses?term=2026-2` muestra materia, paralelo, docente, cupo máximo y **cupos disponibles**.
- Se indica si el estudiante ya está inscrito en cada curso.

### HU-08 · Ver mis cursos asignados 🔴
**Como** TEACHER **quiero** ver los cursos que dicto y sus inscritos **para** gestionar mis clases.
- `GET /api/courses/mine` devuelve solo los cursos del docente autenticado.
- `GET /api/courses/:id/enrolled-students` está disponible solo para el docente del curso o el ADMIN (`403` en otro caso).

---

## E3 — Estudiantes e inscripciones

### HU-09 · Registrar estudiantes 🔴
**Como** ADMIN **quiero** registrar estudiantes **para** que puedan acceder al sistema e inscribirse.
- Crea el usuario con rol `STUDENT` y su perfil: `studentCode` (único), `name`, `email` (único), `program` (carrera).
- Código o email duplicado → `409`.
- Se permite listar, editar y desactivar estudiantes.

### HU-10 · Inscribirme a un curso 🔴 ⭐ *(regla de negocio central)*
**Como** STUDENT **quiero** inscribirme a un curso de la oferta **para** cursar la materia.
- **Validación de cupo:** si `inscripciones activas >= maxCapacity` → `409 CourseFullError` ("El curso no tiene cupos disponibles").
- **Validación de duplicado:** si el estudiante ya está inscrito en ese curso → `409 DuplicateEnrollmentError` ("Ya estás inscrito en este curso").
- La operación es transaccional con lock sobre el curso: dos solicitudes simultáneas al último cupo no generan sobrecupo.
- La restricción `UNIQUE (student_id, course_id)` en la base de datos actúa como respaldo.
- Al inscribirse se emite el evento `enrollment.created` (auditoría).
- En el front, el botón "Inscribirme" se deshabilita sin cupos o si ya hay inscripción, y los errores del backend se muestran con toast.

### HU-11 · Inscribir a un estudiante (admin) 🟡
**Como** ADMIN **quiero** inscribir a cualquier estudiante en un curso **para** resolver casos especiales.
- Aplica exactamente las mismas validaciones que HU-10 (el mismo caso de uso).

### HU-12 · Ver mis inscripciones 🔴
**Como** STUDENT **quiero** ver los cursos en los que estoy inscrito **para** conocer mi carga académica.
- `GET /api/enrollments/mine`, filtrable por gestión.

### HU-13 · Cancelar una inscripción 🟡
**Como** STUDENT o ADMIN **quiero** cancelar una inscripción **para** liberar el cupo.
- Cambia el estado a `CANCELLED` (sin borrado físico) y libera el cupo.
- No se puede cancelar si ya tiene notas registradas (`409`).

---

## E4 — Notas y calificaciones

### HU-14 · Registrar notas por inscripción 🔴 ⭐
**Como** TEACHER **quiero** registrar las notas de los estudiantes de mi curso **para** evaluar su desempeño.
- Tipos de nota: `PARTIAL_1`, `PARTIAL_2`, `FINAL`, con ponderaciones por defecto (30 / 30 / 40).
- El valor va de 0 a 100 (`400` fuera de rango).
- Solo el docente asignado al curso puede registrar notas (`403 ForbiddenActionError` en otro caso).
- Una sola nota por tipo y por inscripción (registrar de nuevo actualiza la existente).
- No se registran notas en inscripciones canceladas.
- Se emite el evento `grade.recorded`.
- En el front: tabla de inscritos con inputs por tipo de nota y guardado por fila.

### HU-15 · Editar una nota 🟡
**Como** TEACHER **quiero** corregir una nota registrada **para** enmendar errores.
- `PATCH /api/grades/:id`, con las mismas validaciones de permiso y rango que HU-14.

### HU-16 · Consultar mi historial académico 🔴 ⭐
**Como** STUDENT **quiero** ver mi historial académico **para** conocer mi rendimiento.
- Muestra por gestión: materia, paralelo, notas parciales, **nota final calculada** y estado (`APPROVED` si es ≥ 51, `FAILED` si es menor, `IN_PROGRESS` si faltan notas).
- La nota final se calcula con `GradeCalculationStrategy` (promedio ponderado por defecto).
- Un estudiante solo puede ver su propio historial (`403` si intenta ver otro).

### HU-17 · Consultar el historial de cualquier estudiante 🟡
**Como** ADMIN **quiero** ver el historial de cualquier estudiante **para** dar seguimiento académico.
- `GET /api/students/:id/history`, que reutiliza el mismo caso de uso que HU-16.

### HU-18 · Promedio general ⚪
**Como** STUDENT **quiero** ver mi promedio general ponderado por créditos **para** conocer mi rendimiento global.

---

## Calidad transversal (aplica a todas las historias)
- 🔴 Tests unitarios de `EnrollStudentUseCase` (cupo lleno, duplicado, éxito) y `RecordGradeUseCase` (docente no asignado, fuera de rango, éxito) y de la estrategia de cálculo.
- 🟡 Tests e2e: login → inscripción → registro de nota → historial.
- 🔴 Errores con formato uniforme `{ statusCode, message, error }`; las pantallas manejan los estados de carga, vacío y error.
- 🔴 Commits por historia con Conventional Commits (`feat(enrollments): HU-10 validate capacity`).

---

## Orden de implementación sugerido (tiempo restante ~2 h 20 min)

| Bloque | Historias | Tiempo aprox. |
|---|---|---|
| 1. Infraestructura | F0.1, F0.2 | 20 min |
| 2. Auth | HU-01, HU-02, HU-03 | 25 min |
| 3. Catálogo | HU-05, HU-06, HU-07, HU-08, HU-09 | 25 min |
| 4. Inscripciones ⭐ | HU-10, HU-12 + tests | 25 min |
| 5. Notas ⭐ | HU-14, HU-16 + tests | 25 min |
| 6. Entregables | F0.4 (README + diagrama), revisar `docker compose up` desde cero | 15 min |
| 7. Si sobra tiempo | 🟡 y luego ⚪ | — |

> Reservar los últimos 10–15 minutos para probar `docker compose up --build` en limpio y enviar el correo antes de las 12:00.