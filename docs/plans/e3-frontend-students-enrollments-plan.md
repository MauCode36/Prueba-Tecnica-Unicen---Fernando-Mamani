# Plan de Implementación Frontend — Épica E3: Estudiantes e Inscripciones

## 1. Objetivo y Alcance
Implementar la **Épica E3 (Estudiantes e inscripciones)** en `unicen_frontend`, respetando las reglas de [`unicen_frontend/AGENTS.md`](../../unicen_frontend/AGENTS.md), las decisiones de [`unicen_frontend/docs/decisions.md`](../../unicen_frontend/docs/decisions.md) (FD-001 a FD-013) y la guía visual de [`DESIGN.md`](../../unicen_frontend/DESIGN.md).

El contrato HTTP está en el [plan de integración E3](./e3-integration-students-enrollments-plan.md). El backend correspondiente está en el [plan backend E3](./e3-backend-students-enrollments-plan.md).

> **Precondición:** el frontend de E2 se está escribiendo en paralelo (`features/courses`, `features/subjects`, `DataState`, `TableSkeleton`, `ConfirmDialog`, `date.utils`). E3 **empieza cuando E2 esté commiteado**, porque toca tres de sus archivos (§3.2 y §4.3). Antes de esa fecha solo se pueden escribir los archivos nuevos de `students` y `enrollments`.

### Historias de usuario cubiertas
| HU | Rol | Pantalla |
|---|---|---|
| **HU-09** · Registrar estudiantes 🔴 | ADMIN | `/students` |
| **HU-10** · Inscribirme a un curso 🔴 ⭐ | STUDENT | Botón "Inscribirme" en `/courses` (oferta) |
| **HU-11** · Inscribir a un estudiante 🟡 | ADMIN | `/students/:studentId/enrollments` → "Inscribir en curso" |
| **HU-12** · Ver mis inscripciones 🔴 | STUDENT | `/enrollments` |
| **HU-13** · Cancelar una inscripción 🟡 | STUDENT (propias), ADMIN | `/enrollments` y `/students/:studentId/enrollments` |

---

## 2. Reglas de `AGENTS.md` que guían este plan
- **Flujo:** `Component → hook → service → httpClient → API`.
- **Sin lógica de negocio:** el botón "Inscribirme" se **deshabilita** sin cupos o si ya hay inscripción (lo pide `tasks.md`, HU-10), pero eso es solo UX. El cupo, el duplicado y la concurrencia los decide el backend, y su `409` se muestra con `toast.error(getApiErrorMessage(error))`.
- **Sin importar internos de otro feature.** Este plan introduce **APIs públicas por feature** (`features/<name>/index.ts`, decisión FD-014): otro feature solo puede importar desde `@/features/<name>`, nunca desde sus subcarpetas. Las dependencias van en **un solo sentido**:
  ```
  courses ──▶ enrollments ──▶ students        (sin ciclos)
  ```
- **Límites:** componentes de hasta 250 líneas, un componente por archivo; resto de archivos hasta 600 líneas.
- **JSDoc** en todo lo exportado; **estados** de carga, vacío y error en cada vista; las acciones que el rol no puede ejecutar se **ocultan**.
- Todo en inglés; el texto visible en español.

---

## 3. Preparación (después del commit de E2)

### 3.1. Renombrar features — [MOVE]
| Actual | Nuevo |
|---|---|
| `src/features/estudiantes/` | `src/features/students/` |
| `src/features/inscripciones/` | `src/features/enrollments/` |

Se elimina `api/`, se reemplaza `schemas.ts` por `schemas/*.schema.ts` y se crean `services/`, `utils/` e `index.ts`.

### 3.2. Gestión y query keys compartidas — [MOVE] / [NEW]
`term` lo usan `courses`, `enrollments` y, en E4, `grades`; por eso deja de ser interno de `courses` (FD-015):
| Desde | Hacia |
|---|---|
| `features/courses/utils/term.utils.ts` | `shared/lib/term.utils.ts` |
| `features/courses/components/TermSelect.tsx` | `shared/components/TermSelect.tsx` |
| `features/courses/hooks/useTermFilter.ts` | `shared/hooks/useTermFilter.ts` |

Se actualizan los imports de `courses` (solo rutas, sin cambios de comportamiento).

`shared/api/query-roots.ts` [NEW]:
```ts
/** Root query keys per feature, so one feature can invalidate another without importing its internals. */
export const QUERY_ROOTS = {
  courses: 'courses',
  enrollments: 'enrollments',
  students: 'students',
} as const
```
`coursesKeys.all` pasa a `[QUERY_ROOTS.courses] as const`. Así una inscripción invalida la oferta (cupos e `isEnrolled`) sin importar `courses/hooks`.

### 3.3. Componentes shadcn — [NEW]
```bash
npx shadcn@latest add switch tooltip
```
`switch` se usa para el estado activo/inactivo del estudiante y `tooltip` para explicar por qué el botón "Inscribirme" está deshabilitado.

---

## 4. Estructura y archivos

### 4.1. Feature `students` (HU-09)
```
src/features/students/
├── components/
│   ├── StudentTable.tsx            # código, nombre, email, carrera, estado, acciones
│   ├── StudentFilters.tsx          # búsqueda (debounce 300 ms) + filtro activo/inactivo
│   ├── StudentFormDialog.tsx       # crear / editar
│   ├── StudentFormFields.tsx       # password solo en modo crear
│   ├── StudentStatusBadge.tsx      # "Activo" / "Inactivo"
│   └── StudentRowActions.tsx       # editar · ver inscripciones · activar/desactivar
├── hooks/
│   ├── students.keys.ts            # studentsKeys.all / list(filters) / detail(id)
│   ├── useStudents.ts
│   ├── useStudent.ts               # detalle (lo usa enrollments vía index.ts)
│   ├── useCreateStudent.ts
│   ├── useUpdateStudent.ts
│   ├── useUpdateStudentStatus.ts
│   ├── useStudentForm.ts           # useForm + zodResolver; cambia de esquema según el modo
│   └── useStudentFilters.ts        # search e isActive en la URL (?search=&status=)
├── pages/
│   └── StudentsPage.tsx
├── schemas/
│   └── student.schema.ts
├── services/
│   └── students.service.ts
├── types.ts
└── index.ts                        # API pública: useStudent, Student, StudentStatusBadge
```

**`types.ts`**
```ts
/** Student profile joined with its user account. */
export interface Student {
  id: string; userId: string; studentCode: string; name: string
  email: string; program: string; isActive: boolean; createdAt: string
}
export interface CreateStudentRequest { name: string; email: string; password: string; studentCode: string; program: string }
export type UpdateStudentRequest = Partial<Omit<CreateStudentRequest, 'password'>>
export interface StudentsFilters { search?: string; isActive?: boolean }
```

**`schemas/student.schema.ts`**
```ts
const baseStudentSchema = z.object({
  name: z.string().trim().min(1, 'Ingresa el nombre').max(150),
  email: z.string().trim().toLowerCase().email('Correo inválido').max(255),
  studentCode: z.string().trim().min(1, 'Ingresa el código').max(20)
    .regex(/^[A-Za-z0-9-]+$/, 'Solo letras, números y guiones').transform((v) => v.toUpperCase()),
  program: z.string().trim().min(1, 'Ingresa la carrera').max(150),
})
export const createStudentSchema = baseStudentSchema.extend({
  password: z.string().min(6, 'Mínimo 6 caracteres').max(72),
})
export const updateStudentSchema = baseStudentSchema
```

**`services/students.service.ts`**: `getStudents(filters)`, `getStudent(id)`, `createStudent`, `updateStudent` y `updateStudentStatus(id, isActive)`. Son funciones `async` tipadas con JSDoc y `@throws {AxiosError}`.

**`StudentsPage`** (ADMIN)
- Encabezado "Estudiantes" + botón "Nuevo estudiante".
- `StudentFilters` → `DataState` → `StudentTable`. Vacío: "No se encontraron estudiantes".
- Desactivar abre `ConfirmDialog` ("El estudiante no podrá iniciar sesión ni inscribirse. Sus inscripciones actuales se mantienen."). Activar no pide confirmación.
- "Ver inscripciones" navega a `/students/:id/enrollments` (solo una ruta, sin importar `enrollments`).
- Los `409` (código o email duplicado) se muestran con `toast.error`.

### 4.2. Feature `enrollments` (HU-10 a HU-13)
```
src/features/enrollments/
├── components/
│   ├── EnrollButton.tsx                # botón + tooltip del motivo de deshabilitado
│   ├── MyEnrollmentsTable.tsx          # materia, paralelo, docente, créditos, fecha, cancelar
│   ├── EnrollmentsSummary.tsx          # "3 materias · 13 créditos" de la gestión
│   ├── StudentEnrollmentsTable.tsx     # vista ADMIN de un estudiante (+ estado)
│   ├── StudentHeader.tsx               # código, nombre, carrera, estado (usa useStudent)
│   ├── AdminEnrollDialog.tsx           # elegir curso de la gestión → inscribir
│   ├── CourseOptionSelect.tsx          # select de cursos con cupos en la etiqueta
│   └── CancelEnrollmentButton.tsx      # ConfirmDialog + useCancelEnrollment
├── hooks/
│   ├── enrollments.keys.ts             # enrollmentsKeys.all / mine(term) / list(filters) / courseOptions(term)
│   ├── useEnrollInCourse.ts            # STUDENT
│   ├── useAdminEnrollStudent.ts        # ADMIN (HU-11)
│   ├── useMyEnrollments.ts
│   ├── useStudentEnrollments.ts        # ADMIN: GET /enrollments?studentId=&term=
│   ├── useCancelEnrollment.ts
│   ├── useEnrollCourseOptions.ts       # GET /courses?term= para el diálogo ADMIN
│   └── useEnrollButtonState.ts         # deriva isDisabled y el motivo (solo UX)
├── pages/
│   ├── MyEnrollmentsPage.tsx           # STUDENT · /enrollments
│   └── StudentEnrollmentsPage.tsx      # ADMIN · /students/:studentId/enrollments
├── services/
│   ├── enrollments.service.ts
│   └── enroll-course-options.service.ts
├── utils/
│   └── enrollment.utils.ts             # sumCredits, formatCourseLabel
├── types.ts
└── index.ts                            # API pública: EnrollButton
```

**`types.ts`**
```ts
export const EnrollmentStatus = { ACTIVE: 'ACTIVE', CANCELLED: 'CANCELLED' } as const
export type EnrollmentStatus = (typeof EnrollmentStatus)[keyof typeof EnrollmentStatus]

/** Result of enrolling or cancelling. */
export interface Enrollment { id: string; studentId: string; courseId: string; status: EnrollmentStatus; enrolledAt: string }

/** Enrollment with course and student data, for lists. */
export interface EnrollmentSummary {
  id: string; status: EnrollmentStatus; enrolledAt: string
  student: { id: string; studentCode: string; name: string }
  course: {
    id: string; term: string; section: string
    subject: { code: string; name: string; credits: number }
    teacher: { name: string }
  }
}
export interface CreateEnrollmentRequest { courseId: string; studentId?: string }
export interface EnrollmentsFilters { studentId?: string; courseId?: string; term?: string; status?: EnrollmentStatus }

/** Minimal course data that EnrollButton needs; matches a subset of the courses `Course` type. */
export interface EnrollableCourse { id: string; availableSeats: number; isEnrolled: boolean }
```
> `EnrollableCourse` es un tipo **estructural** propio. `CourseOfferTable` le pasa su `Course` y TypeScript lo acepta sin que `enrollments` importe tipos de `courses`.

**`services/enrollments.service.ts`**
- `enroll(payload: CreateEnrollmentRequest)`: `POST /enrollments`.
- `getMyEnrollments(term?)`: `GET /enrollments/mine`.
- `getEnrollments(filters)`: `GET /enrollments`.
- `cancelEnrollment(id)`: `PATCH /enrollments/:id/cancel`.

**`services/enroll-course-options.service.ts`**
- `getEnrollCourseOptions(term)`: llama a `GET /courses?term=` y devuelve `{ value, label: 'MAT-101 A · Cálculo I — 12 cupos', isDisabled: availableSeats === 0 }[]`. Se duplica la llamada a propósito, igual que FD-011, porque `courses` ya depende de `enrollments` y no puede haber un ciclo.

**Invalidación tras las mutaciones** (inscribir, inscribir como ADMIN y cancelar):
```ts
queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.enrollments] })
queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.courses] }) // cupos e isEnrolled
```
Mensajes: `toast.success('Inscripción realizada')`, `'Estudiante inscrito'` y `'Inscripción cancelada'`. En `onError` se usa `toast.error(getApiErrorMessage(error))`, que muestra el texto del backend ("El curso no tiene cupos disponibles", "Ya estás inscrito en este curso", etc.).

**`EnrollButton`** (lo consume `courses`)
```tsx
interface EnrollButtonProps {
  /** Course row from the offering; only seats and enrollment status are read. */
  course: EnrollableCourse
}
```
- `useEnrollButtonState(course)` devuelve `{ isDisabled, reason }`. Si `isEnrolled`, el motivo es "Ya estás inscrito"; si `availableSeats === 0`, "Sin cupos disponibles".
- Mientras la mutación está pendiente muestra un spinner y "Inscribiendo…", y se deshabilita para evitar doble clic.
- No hay actualización optimista: el cupo real lo confirma el backend y la invalidación refresca la fila.

**`MyEnrollmentsPage`** (STUDENT, `/enrollments`)
- `TermSelect` (de `shared`, gestión en `?term=`).
- `EnrollmentsSummary`: "N materias · M créditos", con `sumCredits` (suma de presentación).
- `DataState` → `MyEnrollmentsTable` con la acción `CancelEnrollmentButton` ("¿Cancelar tu inscripción en MAT-101 A? Se liberará tu cupo.").
- Vacío: "No tienes inscripciones en la gestión {term}", con un enlace a "Ver oferta de cursos" (`/courses?term={term}`).

**`StudentEnrollmentsPage`** (ADMIN, `/students/:studentId/enrollments`)
- `StudentHeader` con `useStudent(studentId)` importado de `@/features/students`. Si responde `404`, muestra "Estudiante no encontrado" y un enlace a `/students`.
- `TermSelect` + botón "Inscribir en curso", oculto si el estudiante está inactivo, con un aviso "Estudiante inactivo".
- `AdminEnrollDialog`: `CourseOptionSelect` con la oferta de la gestión elegida; las opciones sin cupo se ven deshabilitadas. Al enviar llama a `useAdminEnrollStudent({ courseId, studentId })`.
- `StudentEnrollmentsTable` muestra activas y canceladas (badge de estado). Las activas tienen `CancelEnrollmentButton`.

### 4.3. Cambios en `courses` (E2) — [MODIFY]
- `CourseOfferTable.tsx`: en la columna de acciones reservada, si `canEnroll` (`role === STUDENT`) renderiza `<EnrollButton course={course} />`, importado de `@/features/enrollments`. TEACHER sigue viendo la tabla en solo lectura.
- `courses.keys.ts`: `all: [QUERY_ROOTS.courses]`.
- Imports de `TermSelect`, `term.utils` y `useTermFilter` desde `shared/`.

### 4.4. Gestión de usuarios (E1) — [MODIFY si existe]
Si existe un formulario de creación de usuarios (`CreateUserDialog`), se quita la opción `STUDENT` del select de rol y se agrega un texto de ayuda: "Los estudiantes se registran desde Estudiantes". Corresponde a BD-022: el backend responde `400`.

---

## 5. Rutas y navegación

### 5.1. `src/app/router.tsx` — [MODIFY]
```tsx
{
  element: <ProtectedRoute roles={[Role.ADMIN]} />,
  children: [
    { path: 'students', element: <StudentsPage /> },
    { path: 'students/:studentId/enrollments', element: <StudentEnrollmentsPage /> },
  ],
},
{
  element: <ProtectedRoute roles={[Role.STUDENT]} />,
  children: [{ path: 'enrollments', element: <MyEnrollmentsPage /> }],
},
```
`/enrollments` pasa a ser **solo para STUDENT**. El ADMIN gestiona inscripciones desde la ficha de cada estudiante (HU-11 y HU-13).

### 5.2. `src/app/layouts/nav-items.ts` — [MODIFY]
```ts
{ to: '/students', label: 'Estudiantes', roles: [Role.ADMIN] },
{ to: '/enrollments', label: 'Mis inscripciones', roles: [Role.STUDENT] },
```
El ítem "Estudiantes" sigue activo en `/students/:id/enrollments` (sin `end`).

---

## 6. Verificación

### 6.1. Comandos
```bash
cd unicen_frontend
npm run lint
npm run build
```
Verificación del sentido de las dependencias entre features: el primer comando no debe devolver nada y los otros dos solo deben mostrar imports de `index`:
```bash
grep -rn "@/features/courses" src/features/enrollments src/features/students
grep -rn "@/features/enrollments/" src/features/courses
grep -rn "@/features/students/" src/features/enrollments
```

### 6.2. Prueba manual en el navegador (con el backend E3 y el seed)
| Rol | Paso | Esperado |
|---|---|---|
| ADMIN | `/students` → crear con código `S-2026001` | Toast "Ya existe un estudiante con ese código" |
| ADMIN | Crear un estudiante nuevo e iniciar sesión con él | Llega a `/courses`, con "Mis inscripciones" vacío |
| ADMIN | Desactivar al estudiante nuevo | Badge "Inactivo"; su login falla con "Credenciales inválidas" |
| ADMIN | Ficha de Ana → "Inscribir en curso" (SIS-301 A) | Toast de éxito; la fila aparece y `availableSeats` baja en `/courses` |
| ADMIN | Inscribir a Ana otra vez en el mismo curso | Toast "Ya estás inscrito en este curso" (`409`) |
| STUDENT (Ana) | `/courses` → "Inscribirme" en PRG-101 A | Toast de éxito; el botón pasa a "Inscrito" y los cupos bajan a 0 |
| STUDENT (Camila) | `/courses` → PRG-101 A | Botón deshabilitado con tooltip "Sin cupos disponibles" |
| STUDENT | Dos pestañas: inscribirse en la primera y luego en la segunda sin recargar | La segunda muestra el toast `409` del backend y se refresca |
| STUDENT | `/enrollments` → cancelar | Confirmación; la fila desaparece y los cupos se liberan en `/courses` |
| STUDENT | `/enrollments` → gestión `2026-1` | Solo FIS-101 A |
| TEACHER | Ir a `/enrollments` | Redirige a `/403` |
| Todos | Backend caído | Estado de error con "Reintentar" |

También se revisa la vista a 375 px: las tablas tienen scroll horizontal dentro de su contenedor y los diálogos ocupan todo el ancho.

---

## 7. Decisiones técnicas a registrar en `unicen_frontend/docs/decisions.md`
- **FD-014 — API pública por feature (`index.ts`):** un feature solo importa desde `@/features/<name>`, nunca sus subcarpetas. Las dependencias van en un solo sentido: `courses → enrollments → students`.
- **FD-015 — La gestión es un concepto compartido:** `term.utils`, `TermSelect` y `useTermFilter` pasan a `shared/`, porque los usan `courses`, `enrollments` y `grades`.
- **FD-016 — `QUERY_ROOTS` compartidos:** permiten invalidar entre features sin importar sus `keys`.
- **FD-017 — El botón "Inscribirme" se deshabilita solo por UX:** sin actualización optimista; la fuente de verdad del cupo es el `409` del backend.

---

## 8. Checklist de cierre (`AGENTS.md`)
- [ ] `npm run lint` y `npm run build` sin errores.
- [ ] Componentes de hasta 250 líneas y demás archivos hasta 600; un componente por archivo.
- [ ] JSDoc en componentes, hooks, services y utils; las props documentadas.
- [ ] Ningún componente importa `httpClient`; los imports entre features pasan solo por `index.ts`, sin ciclos.
- [ ] Carga, vacío y error en `StudentsPage`, `MyEnrollmentsPage` y `StudentEnrollmentsPage`.
- [ ] Commits:
  - `refactor(frontend): rename students and enrollments features, share term utils`
  - `feat(students): HU-09 students management page`
  - `feat(enrollments): HU-10 enroll button in course offering`
  - `feat(enrollments): HU-11 admin enrolls a student`
  - `feat(enrollments): HU-12 my enrollments page`
  - `feat(enrollments): HU-13 cancel enrollment`
