# Plan de Implementación Frontend — Épica E2: Materias y Cursos

## 1. Objetivo y Alcance
Implementar la **Épica E2 (Materias y cursos)** en `unicen_frontend`, respetando las reglas de [`unicen_frontend/AGENTS.md`](../../unicen_frontend/AGENTS.md), las decisiones de [`unicen_frontend/docs/decisions.md`](../../unicen_frontend/docs/decisions.md) y la guía visual de [`unicen_frontend/DESIGN.md`](../../unicen_frontend/DESIGN.md).

El contrato HTTP está en el [plan de integración E2](./e2-integration-subjects-courses-plan.md). El backend correspondiente está en el [plan backend E2](./e2-backend-subjects-courses-plan.md).

### Historias de usuario cubiertas
| HU | Rol | Pantalla |
|---|---|---|
| **HU-05** · Catálogo de materias 🔴 | ADMIN gestiona; todos consultan | `/subjects` |
| **HU-06** · Oferta de cursos por gestión 🔴 | ADMIN | `/courses` (vista de gestión) |
| **HU-07** · Consultar la oferta 🔴 | STUDENT (y TEACHER solo lectura) | `/courses` (vista de oferta) |
| **HU-08** · Mis cursos asignados 🔴 | TEACHER (inscritos: TEACHER y ADMIN) | `/courses/mine`, `/courses/:courseId/students` |

### Fuera de alcance
- El botón **"Inscribirme"** y su mutación (HU-10, E3). En E2 la tabla de oferta deja preparada la columna de acciones y muestra el badge "Inscrito" a partir de `isEnrolled`.

---

## 2. Reglas de `AGENTS.md` que guían este plan
- **Flujo obligatorio:** `Component → hook → service → httpClient → API`. Ningún componente importa `httpClient` ni Axios.
- **Feature-based:** los features `subjects/` y `courses/` son autocontenidos. **Un feature no importa los internos de otro.** Por eso `courses` tiene su propio service para leer las opciones de materias y docentes (ver §4.2), en lugar de importar `features/subjects`.
- **Sin lógica de negocio:** Zod valida solo la forma (formato de gestión, entero positivo). Duplicados, cupo menor a inscritos y docente inválido los valida el backend, y el mensaje se muestra con `toast.error(getApiErrorMessage(error))`.
- **Límites:** componentes de hasta **250 líneas**, un componente por archivo; los handlers y el estado derivado van en hooks.
- **Nombres:** todo en inglés; el texto visible en español. Named exports, alias `@/`, props como `<Component>Props`, booleanos con `is/has/can` y handlers con `handle`/`on`.
- **JSDoc** en cada componente, hook, service y función exportada; las props se documentan en la interface.
- **Estados:** cada vista de datos maneja carga (skeleton), vacío y error (con reintento).
- **Rutas:** `<ProtectedRoute roles={[...]}>`; las acciones que el rol no puede ejecutar **se ocultan**.

---

## 3. Preparación

### 3.1. Renombrar features a inglés (FD-002) — [MOVE]
| Actual | Nuevo |
|---|---|
| `src/features/materias/` | `src/features/subjects/` |
| `src/features/cursos/` | `src/features/courses/` |

En cada uno:
- Eliminar `api/` (vacío); la capa HTTP vive en `services/`.
- Reemplazar `schemas.ts` (vacío) por `schemas/<name>.schema.ts`.
- Crear `services/`, `utils/` y mantener `components/`, `hooks/`, `pages/` y `types.ts`.

> Los features `estudiantes`, `inscripciones` y `notas` se renombran en sus propias épicas, para no mezclar cambios.

### 3.2. Componentes shadcn (`base-nova`, en `src/shared/components/ui`) — [NEW]
```bash
npx shadcn@latest add table dialog alert-dialog select badge skeleton field
```
No se editan, salvo que sea necesario.

### 3.3. Utilidades compartidas — [NEW]
- `src/shared/components/DataState.tsx`: un componente para los estados de una vista de datos. Props: `isLoading`, `isError`, `isEmpty`, `emptyMessage`, `onRetry` y `children`. Evita repetir la lógica de carga, vacío y error en cada tabla.
- `src/shared/components/TableSkeleton.tsx`: filas skeleton parametrizables (`rows`, `columns`).
- `src/shared/components/ConfirmDialog.tsx`: wrapper de `AlertDialog` para confirmar eliminaciones (`title`, `description`, `confirmLabel`, `isPending`, `onConfirm`).
- `src/shared/lib/date.utils.ts`: `formatDate(iso)` con `Intl.DateTimeFormat('es-BO')`, para las fechas ISO 8601 que envía la API (por ejemplo, `enrolledAt`).
- `src/shared/lib/http-status.utils.ts`: `getHttpStatus(error)` devuelve el status de un `AxiosError` (o `undefined`) e `isClientError(error)` indica si es 4xx. Las páginas deciden por `status` y nunca por el campo `error`, porque los `400` de validación y los `403` del guard de roles no traen el formato de error de dominio (ver §3 del plan de integración).

Van en `shared/` porque los usan ambos features y los usarán E3 y E4.

---

## 4. Estructura y archivos

### 4.1. Feature `subjects` (HU-05)
```
src/features/subjects/
├── components/
│   ├── SubjectTable.tsx          # código, nombre, créditos, acciones (solo ADMIN)
│   ├── SubjectFormDialog.tsx     # crear/editar (modo según si recibe `subject`)
│   ├── SubjectFormFields.tsx     # campos RHF (code, name, credits)
│   └── SubjectRowActions.tsx     # editar / eliminar
├── hooks/
│   ├── subjects.keys.ts          # subjectsKeys.all / list() / detail(id)
│   ├── useSubjects.ts            # useQuery(getSubjects)
│   ├── useCreateSubject.ts       # useMutation + invalidate + toast
│   ├── useUpdateSubject.ts
│   ├── useDeleteSubject.ts
│   └── useSubjectForm.ts         # useForm + zodResolver + defaults + submit
├── pages/
│   └── SubjectsPage.tsx          # solo composición
├── schemas/
│   └── subject.schema.ts
├── services/
│   └── subjects.service.ts
└── types.ts
```

**`types.ts`**
```ts
/** Subject of the academic catalog. */
export interface Subject { id: string; code: string; name: string; credits: number; createdAt: string }
/** Payload for POST /subjects. */
export interface CreateSubjectRequest { code: string; name: string; credits: number }
/** Payload for PATCH /subjects/:id. */
export type UpdateSubjectRequest = Partial<CreateSubjectRequest>
```

**`schemas/subject.schema.ts`** (solo forma)
```ts
export const subjectSchema = z.object({
  code: z.string().trim().min(1, 'Ingresa el código').max(20)
    .regex(/^[A-Za-z0-9-]+$/, 'Solo letras, números y guiones')
    .transform((value) => value.toUpperCase()),
  name: z.string().trim().min(1, 'Ingresa el nombre').max(150),
  credits: z.coerce.number().int('Debe ser un número entero').min(1, 'Mínimo 1 crédito').max(20),
})
/** Raw form values (what the inputs hold). */
export type SubjectFormInput = z.input<typeof subjectSchema>
/** Parsed values sent to the API (coerced and uppercased). */
export type SubjectFormValues = z.output<typeof subjectSchema>
```
> Con Zod 4, `z.coerce` tiene entrada `unknown` y `.transform()` cambia la salida, así que entrada y salida difieren. `useSubjectForm` tipa `useForm<SubjectFormInput, unknown, SubjectFormValues>` con `zodResolver(subjectSchema)`. Si se usa `z.infer` (como en `loginSchema`), no compila.

**`services/subjects.service.ts`**: `getSubjects()`, `createSubject(payload)`, `updateSubject(id, payload)` y `deleteSubject(id)`. Son funciones `async` tipadas con JSDoc y `@throws {AxiosError}`.

**Hooks de mutación**: en `onSuccess` invalidan `subjectsKeys.all`, muestran `toast.success('Materia creada' | 'Materia actualizada' | 'Materia eliminada')` y cierran el diálogo con el callback `onSuccess` del consumidor. En `onError` muestran `toast.error(getApiErrorMessage(error))`, que cubre el `409` por código duplicado y por materia con cursos.

**`SubjectsPage`**
- Encabezado "Materias". Si `canManage = user.role === Role.ADMIN`, muestra el botón "Nueva materia".
- `DataState` con `TableSkeleton` → `SubjectTable` (`canManage` decide si se renderiza la columna de acciones).
- Estado vacío: "Aún no hay materias registradas".

### 4.2. Feature `courses` (HU-06, HU-07, HU-08)
```
src/features/courses/
├── components/
│   ├── TermSelect.tsx                 # selector de gestión (controlled)
│   ├── SeatsBadge.tsx                 # "12 / 30 disponibles"; tono según disponibilidad
│   ├── CourseManagementTable.tsx      # ADMIN: materia, paralelo, docente, cupo, inscritos, acciones
│   ├── CourseRowActions.tsx           # editar / ver inscritos / eliminar
│   ├── CourseFormDialog.tsx           # crear/editar curso
│   ├── CourseFormFields.tsx           # selects materia/docente + term, section, maxCapacity
│   ├── CourseOfferTable.tsx           # STUDENT/TEACHER: oferta + badge "Inscrito"
│   ├── TeacherCourseCard.tsx          # tarjeta de un curso asignado
│   └── EnrolledStudentsTable.tsx      # código, nombre, email, carrera, fecha de inscripción
├── hooks/
│   ├── courses.keys.ts
│   ├── useCourses.ts                  # useQuery(getCourses(term))
│   ├── useMyCourses.ts
│   ├── useCourse.ts                   # detalle (título de la página de inscritos)
│   ├── useEnrolledStudents.ts
│   ├── course-options.keys.ts         # courseOptionsKeys (fuera de coursesKeys.all)
│   ├── useCourseOptions.ts            # materias + docentes activos para los selects
│   ├── useCreateCourse.ts / useUpdateCourse.ts / useDeleteCourse.ts
│   ├── useCourseForm.ts               # useForm + zodResolver + defaults
│   └── useTermFilter.ts               # term en la URL (?term=); si falta o es inválido, getCurrentTerm
├── pages/
│   ├── CoursesPage.tsx                # ADMIN → gestión, resto → oferta
│   ├── MyCoursesPage.tsx              # TEACHER
│   └── CourseStudentsPage.tsx         # TEACHER (propio) / ADMIN
├── schemas/
│   └── course.schema.ts
├── services/
│   ├── courses.service.ts
│   └── course-options.service.ts      # GET /subjects y GET /users?role=TEACHER
├── utils/
│   ├── term.utils.ts
│   └── seats.utils.ts
└── types.ts
```

**`types.ts`**
```ts
export interface CourseSubject { id: string; code: string; name: string; credits: number }
export interface CourseTeacher { id: string; name: string }
/** Course offering with computed seats, as returned by the API. */
export interface Course {
  id: string; term: string; section: string; maxCapacity: number
  enrolledCount: number; availableSeats: number; isEnrolled: boolean
  subject: CourseSubject; teacher: CourseTeacher
}
export interface CreateCourseRequest { subjectId: string; teacherId: string; term: string; section: string; maxCapacity: number }
export type UpdateCourseRequest = Partial<CreateCourseRequest>
/** Mirrors ListCoursesQueryDto; E2 only exposes `term` in the UI. */
export interface CoursesFilters { term?: string; subjectId?: string }
/** Student enrolled in a course; `studentId` is the student profile id, not the user id. */
export interface EnrolledStudent {
  enrollmentId: string; studentId: string; studentCode: string
  name: string; email: string; program: string; enrolledAt: string
}
/** Option for selects (subjects and teachers). */
export interface SelectOption { value: string; label: string }
```

**`schemas/course.schema.ts`**
```ts
export const courseSchema = z.object({
  subjectId: z.string().uuid('Selecciona una materia'),
  teacherId: z.string().uuid('Selecciona un docente'),
  term: z.string().regex(/^\d{4}-[12]$/, 'Formato AAAA-1 o AAAA-2'),
  section: z.string().trim().min(1, 'Ingresa el paralelo').max(10).transform((v) => v.toUpperCase()),
  maxCapacity: z.coerce.number().int('Debe ser un número entero').min(1, 'El cupo debe ser mayor a 0').max(500),
})
export type CourseFormInput = z.input<typeof courseSchema>
export type CourseFormValues = z.output<typeof courseSchema>
```
> Igual que en materias: `useCourseForm` tipa `useForm<CourseFormInput, unknown, CourseFormValues>`.
> La regla de que el cupo no sea menor a los inscritos **no** se valida en Zod: es de negocio. El backend responde `409` y se muestra con un toast.

**`services/courses.service.ts`**
- `getCourses(filters)`: `GET /courses`, con `params: { term, subjectId }`.
- `getMyCourses()`: `GET /courses/mine`.
- `getCourse(id)`: `GET /courses/:id`.
- `getEnrolledStudents(id)`: `GET /courses/:id/enrolled-students`.
- `createCourse`, `updateCourse` y `deleteCourse`.

**`services/course-options.service.ts`**
- `getSubjectOptions(): Promise<SelectOption[]>`: mapea `GET /subjects` a `{ value: id, label: 'MAT-101 · Cálculo I' }`.
- `getTeacherOptions(): Promise<SelectOption[]>`: llama a `GET /users?role=TEACHER`, **descarta los que tienen `isActive: false`** y mapea el resto a `{ value: id, label: name }`. El endpoint devuelve también docentes inactivos, y el backend los rechaza al asignarlos (`400 INVALID_COURSE_TEACHER`).
> Se duplica a propósito una llamada mínima a `/subjects` en vez de importar `features/subjects/services`, porque la regla de `AGENTS.md` prohíbe importar internos de otro feature. Si un tercer feature lo necesita, se mueve a `shared/`.

**`hooks/courses.keys.ts`**
```ts
export const coursesKeys = {
  all: ['courses'] as const,
  list: (filters: CoursesFilters) => [...coursesKeys.all, 'list', filters] as const,
  mine: () => [...coursesKeys.all, 'mine'] as const,
  detail: (id: string) => [...coursesKeys.all, 'detail', id] as const,
  enrolledStudents: (id: string) => [...coursesKeys.all, id, 'enrolled-students'] as const,
}

/** Select options live outside coursesKeys.all so course mutations do not refetch them. */
export const courseOptionsKeys = {
  all: ['course-options'] as const,
}
```
Las mutaciones de cursos invalidan `coursesKeys.all`.

`useCourseOptions(isOpen, currentTeacher?)`:
- Solo se habilita (`enabled`) mientras el diálogo está abierto y usa `refetchOnMount: 'always'`. `subjects` no puede invalidar las queries de `courses`, así que con un `staleTime` largo una materia recién creada en `/subjects` no aparecería en el select.
- En modo edición recibe `course.teacher`. Si ese docente no está entre los activos, lo agrega a las opciones para que el select no quede vacío. El backend solo valida el docente si cambia.
- Las queries de detalle que pueden devolver 4xx (`useCourse`, `useEnrolledStudents`) usan `retry: (count, error) => !isClientError(error) && count < 1`, para mostrar el `403`/`404` sin esperar un reintento. El default global es `retry: 1`.

**`utils/term.utils.ts`** (funciones puras con JSDoc)
- `getCurrentTerm(date = new Date())`: de enero a junio devuelve `YYYY-1`; de julio a diciembre, `YYYY-2`. Para el 27 de octubre de 2026 da `2026-2`.
- `isValidTerm(term)`: valida `^\d{4}-[12]$`. `useTermFilter` lo usa para ignorar un `?term=` editado a mano; con un valor inválido el backend respondería `400` y la página mostraría un error en vez de la oferta.
- `buildTermOptions(center: string, before = 2, after = 1): string[]`: arma la lista de gestiones para `TermSelect`.
- `formatTerm(term)`: `'2026-2'` → `'Gestión 2026-2'`.

**`utils/seats.utils.ts`** (solo presentación, no decide si se puede inscribir)
- `getSeatsTone(available, max)`: devuelve `'none' | 'low' | 'ok'`. Con 0 es `none`; si es ≤ 20 % del cupo, `low`.
- `formatSeats(available, max)`: `'12 / 30 disponibles'` o `'Sin cupos'`.

**Pantallas**

| Página | Ruta | Composición |
|---|---|---|
| `CoursesPage` | `/courses` | `TermSelect` (con `useTermFilter`). **ADMIN:** botón "Nuevo curso" + `CourseManagementTable`. **STUDENT/TEACHER:** `CourseOfferTable` (solo lectura). Las dos envueltas en `DataState`. Vacío: "No hay cursos ofertados en la gestión {term}". |
| `MyCoursesPage` | `/courses/mine` | Grid de `TeacherCourseCard`: materia, paralelo, gestión, `SeatsBadge` y botón "Ver inscritos". Vacío: "No tienes cursos asignados". |
| `CourseStudentsPage` | `/courses/:courseId/students` | Título con `useCourse` ("MAT-101 · Cálculo I — Paralelo A") + `EnrolledStudentsTable` (`enrolledAt` con `formatDate`). Errores según `getHttpStatus`: **403** → mensaje de acceso denegado y enlace a "Mis cursos" (no redirige a `/403`, porque el rol sí tiene acceso a la ruta); **400 o 404** (id inválido por `ParseUUIDPipe` o curso inexistente) → "Curso no encontrado" con el mismo enlace; otro error → estado de error con "Reintentar". Vacío: "Aún no hay estudiantes inscritos". |

**Detalle de componentes**
- `CourseOfferTable`: columnas Materia (código y nombre), Créditos, Paralelo, Docente, `SeatsBadge` y Estado (badge "Inscrito" si `isEnrolled`). La última columna queda reservada para el botón "Inscribirme" de E3.
- `SeatsBadge`: `cn()` según el tono. `none` usa `destructive` ("Sin cupos"); `low`, fondo `navy-tint` con texto `ink` en negrita; `ok`, fondo `navy-tint` con texto `ink-muted`. No usa naranja ni `accent-text`: `DESIGN.md` permite un solo acento naranja por vista, ya lo ocupa el ítem activo de la barra lateral, y una tabla con varios cursos casi llenos repetiría el acento en cada fila.
- `CourseFormDialog`: con `course`, entra en modo edición con los valores precargados y envía solo los campos modificados (`dirtyFields`) al `PATCH`; el backend usa `forbidNonWhitelisted`, así que el payload nunca lleva campos fuera del DTO. `term` toma por defecto el filtro activo. Los selects de Base UI (`base-nova`) se conectan a RHF con `Controller`.
- `CourseRowActions`: "Ver inscritos" navega a `/courses/:id/students`. "Eliminar" usa `ConfirmDialog`; un `409` con inscripciones se muestra como toast.

---

## 5. Rutas y navegación

### 5.1. `src/app/router.tsx` — [MODIFY]
Se reemplazan los `PlaceholderPage` de materias y cursos:
```tsx
{ path: 'subjects', element: <SubjectsPage /> },
{ path: 'courses', element: <CoursesPage /> },
{
  element: <ProtectedRoute roles={[Role.TEACHER]} />,
  children: [{ path: 'courses/mine', element: <MyCoursesPage /> }],
},
{
  element: <ProtectedRoute roles={[Role.TEACHER, Role.ADMIN]} />,
  children: [{ path: 'courses/:courseId/students', element: <CourseStudentsPage /> }],
},
```

### 5.2. `src/app/layouts/nav-items.ts` y `DashboardLayout.tsx` — [MODIFY]
`NavItem` suma `end?: boolean` (documentado: "Match the route exactly, so `/courses` is not active on `/courses/mine`").
```ts
{ to: '/subjects', label: 'Materias', roles: [Role.ADMIN, Role.TEACHER, Role.STUDENT] },
{ to: '/courses', label: 'Oferta de cursos', roles: [Role.ADMIN, Role.TEACHER, Role.STUDENT], end: true },
{ to: '/courses/mine', label: 'Mis cursos', roles: [Role.TEACHER] },
```
`DashboardLayout` pasa `end={item.end}` al `NavLink`. Hoy no lo hace, así que sin este cambio "Oferta de cursos" quedaría marcado también en `/courses/mine`.

### 5.3. `src/features/auth/utils/role-navigation.utils.ts` — [MODIFY]
`DEFAULT_ROUTE_BY_ROLE[Role.TEACHER] = '/courses/mine'`, porque la pantalla principal del docente son sus cursos (HU-08).

---

## 6. Verificación

### 6.1. Comandos
```bash
cd unicen_frontend
npm run lint
npm run build
```

### 6.2. Prueba manual en el navegador (con el backend E2 y el seed)
| Rol | Paso | Esperado |
|---|---|---|
| ADMIN | `/subjects` → crear `MAT-101` | Toast de error "Ya existe una materia con ese código" (`409`) |
| ADMIN | Crear materia nueva, editar sus créditos y eliminarla | La tabla se refresca sin recargar (invalidación) |
| ADMIN | Eliminar `MAT-101` (tiene cursos) | Toast `409` y la fila sigue en la tabla |
| ADMIN | `/courses` → crear un paralelo duplicado | Toast `409` |
| ADMIN | Crear una materia en `/subjects` e ir a "Nuevo curso" enseguida | La materia nueva aparece en el select |
| ADMIN | Abrir "Nuevo curso" | El select de docentes solo lista docentes activos |
| ADMIN | Editar el cupo por debajo de los inscritos | Toast `409` con el número de inscritos |
| STUDENT | `/subjects` | Tabla sin botón "Nueva materia" ni acciones |
| STUDENT | `/courses` → cambiar a `2026-1` | URL `?term=2026-1` y lista filtrada; la columna de cupos se ve |
| STUDENT | Abrir `/courses?term=2026-9` | Muestra la oferta de la gestión actual, no un error |
| STUDENT | Ir a `/courses/mine` | Redirige a `/403` |
| TEACHER | Iniciar sesión | Llega a `/courses/mine` con sus cursos |
| TEACHER | Iniciar sesión e ir a "Mis cursos" | Solo "Mis cursos" queda marcado en la barra lateral |
| TEACHER | Abrir los inscritos de un curso de otro docente (URL manual) | Mensaje de acceso denegado en la página (`403`), sin demora por reintento |
| TEACHER | Abrir `/courses/abc/students` | "Curso no encontrado" con enlace a "Mis cursos" |
| Todos | Cortar el backend y recargar | Estado de error con "Reintentar" |

Revisar también la vista a 375 px de ancho: las tablas tienen scroll horizontal dentro de su contenedor y la página no.

---

## 7. Decisiones técnicas a registrar en `unicen_frontend/docs/decisions.md`
- **FD-011 — Opciones de selects por feature:** `courses` consulta `/subjects` y `/users?role=TEACHER` desde su propio `course-options.service.ts`, para no importar internos de otro feature. Se mueve a `shared/` si aparece un tercer consumidor.
- **FD-012 — Gestión en la URL:** el filtro de gestión vive en `?term=` (con `getCurrentTerm()` por defecto), para que el enlace se pueda compartir y la vista se conserve al recargar.
- **FD-013 — Componentes de estado compartidos:** `DataState`, `TableSkeleton` y `ConfirmDialog` en `shared/components` estandarizan los estados de carga, vacío y error que exige `AGENTS.md`.
- **FD-014 — Errores por status HTTP:** las páginas distinguen los errores con `getHttpStatus()` y no reintentan los 4xx en queries de detalle. El campo `error` del cuerpo no es confiable: los `400` de validación y los `403` del guard de roles usan el formato por defecto de Nest.
- **FD-015 — Tipos de formulario con entrada y salida:** con Zod 4, los formularios que usan `z.coerce` o `.transform()` tipan `useForm<z.input, unknown, z.output>`.

---

## 8. Checklist de cierre (`AGENTS.md`)
- [ ] `npm run lint` y `npm run build` sin errores.
- [ ] Ningún componente supera 250 líneas ni otro archivo 600; un componente por archivo.
- [ ] JSDoc en componentes, hooks, services y utils; las props documentadas.
- [ ] Ningún componente importa `httpClient`; ningún feature importa internos de otro.
- [ ] Carga, vacío y error en `SubjectsPage`, `CoursesPage`, `MyCoursesPage` y `CourseStudentsPage`.
- [ ] Las acciones de ADMIN están ocultas para los otros roles.
- [ ] Commits (Conventional Commits):
  - `refactor(frontend): rename subjects and courses features to english`
  - `feat(subjects): HU-05 subjects catalog page`
  - `feat(courses): HU-06 course management for admin`
  - `feat(courses): HU-07 course offering with seats by term`
  - `feat(courses): HU-08 teacher courses and enrolled students`
