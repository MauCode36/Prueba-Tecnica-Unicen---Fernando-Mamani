# Decisiones técnicas del Frontend

Registro vivo de las decisiones técnicas del frontend (formato ADR liviano). Las entradas nuevas se agregan al final y las anteriores no se reescriben: si una decisión cambia, se añade una entrada nueva que la reemplaza.

**Formato:** contexto → decisión → justificación → consecuencias.

---

## FD-001 — SPA con Vite + React en lugar de Next.js
- **Fecha:** 2026-10-27
- **Contexto:** El backend es una API independiente en NestJS. El sistema es una aplicación interna con autenticación, sin requerimientos de SEO ni SSR.
- **Decisión:** Construir una Single Page Application con Vite + React 19 + TypeScript (modo estricto).
- **Justificación:**
  - Next.js es un framework full stack (API routes, Server Actions, SSR); con un backend separado duplicaría responsabilidades.
  - Toda la lógica de negocio vive en la API; el frontend es únicamente la capa de presentación.
  - El build estático se sirve con Nginx: imagen Docker más liviana y despliegue más simple.
  - Configuración inicial y ciclo de desarrollo más rápidos, algo clave con el límite de 4 horas.
- **Consecuencias:** No hay SSR. La autenticación y la protección de rutas se manejan en el cliente; el backend sigue siendo la fuente de verdad para la autorización.

## FD-002 — Arquitectura por features (Screaming Architecture)
- **Fecha:** 2026-10-27
- **Contexto:** El código debe comunicar el dominio académico y mantenerse ordenado a medida que crecen los módulos.
- **Decisión:** Organizar `src/` por feature (`auth`, `subjects`, `courses`, `students`, `enrollments`, `grades`), con `app/` para la composición y `shared/` para el código transversal.
- **Justificación:** La estructura de carpetas refleja el negocio (inscripciones, notas) y no el framework (components, hooks). Cada feature es autocontenido y fácil de ubicar.
- **Consecuencias:** Un feature no importa los internos de otro; el código reutilizable se mueve a `shared/`.

## FD-003 — Flujo de datos por capas: Componente → Hook → Service → httpClient
- **Fecha:** 2026-10-27
- **Contexto:** Evitar llamadas HTTP y lógica de estado del servidor dispersas en los componentes.
- **Decisión:** Los componentes consumen hooks; los hooks envuelven services con TanStack Query; los services usan una única instancia de Axios (`shared/api/httpClient`).
- **Justificación:** Separación de responsabilidades, mejor testeabilidad y un solo lugar para los headers de autenticación y el manejo de errores.
- **Consecuencias:** Algunos archivos más por feature, a cambio de componentes livianos y legibles.

## FD-004 — TanStack Query para el estado del servidor y Context solo para auth
- **Fecha:** 2026-10-27
- **Contexto:** Casi todo el estado de la aplicación proviene de la API (cursos, inscripciones, notas).
- **Decisión:** Usar TanStack Query v5 para el estado del servidor y React Context solo para la sesión autenticada. Sin Redux ni Zustand.
- **Justificación:** El caché, los estados de carga y error, y la invalidación de queries tras las mutaciones ya vienen incluidos, por lo que no hace falta un store global.
- **Consecuencias:** Las query keys se centralizan por feature para que la invalidación sea predecible.

## FD-005 — Instancia de Axios con interceptores
- **Fecha:** 2026-10-27
- **Decisión:** Una sola instancia de Axios con `baseURL = VITE_API_URL`, un interceptor de request que inyecta el token Bearer y uno de response que cierra la sesión ante un `401`.
- **Justificación:** Autenticación y manejo de errores centralizados; los services quedan libres de responsabilidades transversales.

## FD-006 — Formularios con React Hook Form + Zod
- **Fecha:** 2026-10-27
- **Decisión:** Todos los formularios usan React Hook Form con esquemas de Zod (`@hookform/resolvers`).
- **Justificación:** Validación tipada y declarativa con un mínimo de re-renders. Se integra de forma nativa con el componente `Form` de shadcn.
- **Consecuencias:** Zod solo valida la *forma* de los datos; las reglas de negocio (cupo, duplicados) las valida el backend y se muestran mediante toasts.

## FD-007 — UI con Tailwind CSS v4 + shadcn/ui
- **Fecha:** 2026-10-27
- **Contexto:** La aplicación es principalmente tablas, formularios, modales y selects, y no hay tiempo para un diseño personalizado.
- **Decisión:** Tailwind CSS v4 + shadcn/ui (basado en Radix), íconos de lucide-react y toasts con sonner. Tema por defecto, sin personalizar.
- **Justificación:** Componentes accesibles y de aspecto profesional, cuyo código vive en el repositorio (`shared/components/ui`): es código propio y legible. Se evaluó Mantine y se descartó para mantenerse en Tailwind.
- **Consecuencias:** Se agregan solo los componentes necesarios; se usa el `Table` simple en lugar de un DataTable completo, salvo que sobre tiempo.

## FD-008 — Enrutamiento por rol en el cliente
- **Fecha:** 2026-10-27
- **Decisión:** `<ProtectedRoute roles={[...]}>` redirige a `/login` si no hay sesión y a `/403` si el rol no corresponde. Los ítems del sidebar y las acciones se muestran según el rol (`ADMIN`, `TEACHER`, `STUDENT`).
- **Justificación:** Una experiencia clara para cada rol. Es solo una cuestión de UX: la autorización real la aplican los guards de la API.

## FD-009 — Convenciones de código definidas en AGENTS.md
- **Fecha:** 2026-10-27
- **Decisión:** Todo el código, los nombres de archivos y los JSDoc en inglés (el texto de la UI en español); JSDoc obligatorio; componentes de hasta 250 líneas y demás archivos de hasta 600; convenciones de nombrado explícitas; Conventional Commits.
- **Justificación:** Legibilidad tanto para personas como para agentes de IA, consistencia en el código generado con asistencia de IA y un historial de commits limpio.

## FD-010 — Sin herramientas de monorepo; Docker Compose como orquestador
- **Fecha:** 2026-10-27
- **Decisión:** No se usa Turborepo ni Nx. En desarrollo local, Postgres corre en Docker y cada aplicación con su propio dev server (Vite hace proxy de `/api` hacia `localhost:3000`). Para la entrega, todo se levanta con `docker compose up`.
- **Justificación:** Son dos aplicaciones independientes que se comunican por HTTP; una herramienta de monorepo agregaría configuración sin aportar beneficios.
- **Consecuencias:** La imagen de producción es multi-stage (build con `node:22-alpine` → `nginx:alpine`), con fallback para la SPA y proxy inverso de `/api` hacia el contenedor de la API (no hace falta configurar CORS).

## FD-011 — Opciones de selects por feature
- **Fecha:** 2026-10-27
- **Decisión:** `courses` consulta `/subjects` y `/users?role=TEACHER` desde su propio `course-options.service.ts`. El de docentes descarta los inactivos, porque el backend los rechaza al asignarlos. Al editar, se conserva el docente actual aunque esté inactivo.
- **Justificación:** `AGENTS.md` prohíbe importar internos de otro feature.
- **Consecuencias:** Se mueve a `shared/` si aparece un tercer consumidor. Las opciones se refrescan en cada apertura del diálogo y sus keys viven fuera de `coursesKeys.all`.

## FD-012 — Gestión en la URL
- **Fecha:** 2026-10-27
- **Decisión:** El filtro de gestión vive en `?term=`, con `getCurrentTerm()` por defecto. Un valor mal formado se ignora.
- **Justificación:** El enlace se puede compartir y la vista se conserva al recargar; un valor inválido haría que el backend respondiera `400`.

## FD-013 — Componentes de estado compartidos
- **Fecha:** 2026-10-27
- **Decisión:** `DataState`, `TableSkeleton` y `ConfirmDialog` en `shared/components`.
- **Justificación:** Estandarizan los estados de carga, vacío y error que exige `AGENTS.md` y los usarán E3 y E4.

## FD-014 — Errores por status HTTP
- **Fecha:** 2026-10-27
- **Decisión:** Las páginas distinguen los errores con `getHttpStatus()` y las queries de detalle no reintentan los 4xx.
- **Justificación:** Los `400` de validación y los `403` del guard de roles usan el formato por defecto de Nest, así que el campo `error` del cuerpo no es confiable.

## FD-015 — Tipos de formulario con entrada y salida
- **Fecha:** 2026-10-27
- **Decisión:** Con Zod 4, los formularios que usan `z.coerce` o `.transform()` tipan `useForm<z.input, unknown, z.output>`.
- **Justificación:** La entrada (`unknown`) y la salida difieren, y `z.infer` no compila con el resolver.

## FD-016 — API pública por feature (`index.ts`)
- **Fecha:** 2026-10-27
- **Decisión:** Un feature solo importa de otro desde `@/features/<name>`, nunca desde sus subcarpetas. Las dependencias van en un solo sentido: `courses → enrollments → students`. `enrollments` consulta `/courses` desde su propio servicio, porque `courses` ya depende de él.
- **Justificación:** Evita ciclos y mantiene explícito qué expone cada feature.
- **Consecuencias:** `enrollments` expone `EnrollButton`; `students` expone `useStudent`, `Student` y `StudentStatusBadge`.

## FD-017 — La gestión es un concepto compartido
- **Fecha:** 2026-10-27
- **Decisión:** `term.utils`, `TermSelect` y `useTermFilter` viven en `shared/`, porque los usan `courses`, `enrollments` y `grades`. `useTermFilter` conserva los demás parámetros de la URL al cambiar la gestión.
- **Justificación:** Reemplaza el uso interno que le dio FD-012 en E2.

## FD-018 — Raíces de query compartidas (`QUERY_ROOTS`)
- **Fecha:** 2026-10-27
- **Decisión:** `shared/api/query-roots.ts` define las raíces de query por feature. Inscribir o cancelar invalida `enrollments` y `courses`, aunque falle, porque otra inscripción pudo mover los cupos.
- **Justificación:** Un feature refresca los datos de otro sin importar sus `keys`.

## FD-019 — El botón "Inscribirme" se deshabilita solo por UX
- **Fecha:** 2026-10-27
- **Decisión:** `EnrollButton` se deshabilita sin cupos o si ya hay inscripción, sin actualización optimista. La fuente de verdad es el `409` del backend. El tooltip del motivo cuelga de un `span`, porque un botón `disabled` no emite eventos de hover.
- **Justificación:** El cupo y la concurrencia los decide el backend bajo lock.

---

## Decisiones pendientes
- [ ] Contratos finales de la API (forma de la respuesta del login, endpoints) una vez configurado el backend.
- [ ] Estrategia de almacenamiento del token (`localStorage` por ahora); revisar si sobra tiempo.
- [ ] Impacto de JWT vs. PASETO en el cliente (no se espera ninguno: para el frontend el token es opaco).