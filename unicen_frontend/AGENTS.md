# AGENTS.md — Frontend (UNICEN Academic System)

## Stack
- Vite + React 19 + TypeScript (strict mode, no `any`)
- React Router v7, TanStack Query v5, Axios, React Hook Form + Zod
- Tailwind CSS v4 + shadcn/ui, lucide-react icons, sonner toasts
- Context API only for authentication state

## Architecture: feature-based (Screaming Architecture)
```
src/
├── app/            # router, providers, layouts
├── features/<feature>/
│   ├── components/ # feature UI components
│   ├── pages/      # routed pages (composition only)
│   ├── hooks/      # TanStack Query hooks and UI logic hooks
│   ├── services/   # HTTP calls for this feature
│   ├── schemas/    # Zod schemas
│   ├── utils/      # pure helpers for this feature
│   └── types.ts    # domain types
└── shared/         # api/httpClient, components/ui (shadcn), hooks, utils, types
```
- Features: `auth`, `subjects`, `courses`, `students`, `enrollments`, `grades`.
- A feature never imports from another feature's internals; shared code goes to `shared/`.

## Data flow (mandatory)
`Component → hook → service → httpClient → API`
- Components never call Axios or `fetch` directly.
- Services are plain async functions returning typed data.
- Hooks wrap services with `useQuery` / `useMutation` and invalidate queries after mutations.
- No business logic in the frontend: the backend validates rules; Zod validates form shape only.
- Show backend error messages (e.g. full course, duplicate enrollment) with `toast.error`.

## Size limits
- Components: **max 250 lines**. If exceeded, extract subcomponents, hooks or utils.
- Non-component files (hooks, services, utils, schemas, types): **max 600 lines**.
- Keep JSX lean: move logic, derived state and handlers into custom hooks.
- One component per file.

## Language
- Everything in **English**: file names, identifiers, comments and JSDoc.
- Only user-facing UI text is in Spanish.

## JSDoc (mandatory)
Every component, hook, service and exported function must have JSDoc:
```ts
/**
 * Enrolls the current student in a course.
 * @param courseId - Course identifier.
 * @returns The created enrollment.
 * @throws {AxiosError} When the course is full or enrollment is duplicated.
 */
```
- Components: describe purpose and document each prop in the props interface.
- Keep descriptions short; explain *why* when it is not obvious.

## Naming conventions
| Element | Convention | Example |
|---|---|---|
| Component files | PascalCase `.tsx` | `CourseTable.tsx` |
| Page files | PascalCase + `Page` | `GradeHistoryPage.tsx` |
| Hooks | camelCase, `use` prefix | `useEnrollStudent.ts` |
| Services | camelCase + `.service.ts` | `courses.service.ts` |
| Schemas | camelCase + `.schema.ts` | `subject.schema.ts` |
| Utils | camelCase + `.utils.ts` | `grade.utils.ts` |
| Folders | kebab-case | `features/enrollments/` |
| Types / interfaces | PascalCase, no `I` prefix | `Course`, `CourseTableProps` |
| Enums | PascalCase, UPPER_CASE members | `Role.ADMIN` |
| Constants | UPPER_SNAKE_CASE | `QUERY_KEYS` |
| Booleans | `is/has/can` prefix | `isLoading`, `canEdit` |
| Event handlers | `handle` prefix; props `on` | `handleSubmit`, `onSave` |
| Query keys | centralized per feature | `coursesKeys.list(term)` |

## Code rules
- Named exports only (except where a library requires default).
- Use the `@/` alias for imports from `src/`.
- Props typed with an interface named `<Component>Props`.
- No inline styles; use Tailwind classes and `cn()` for conditional classes.
- Reuse shadcn components from `shared/components/ui`; do not edit them unless necessary.
- Route protection via `<ProtectedRoute roles={[...]}>`; hide actions the role cannot perform.
- Environment variables via `import.meta.env.VITE_*` only.
- Handle loading, empty and error states in every data view.

## Technical Decisions
- Check and add technical decisiones in /docs/decisions.md

## Design
- When de design is required read DESIGN.md and /design

## Before finishing a task
- `npm run lint` and `npm run build` pass with no errors.
- No file exceeds its line limit.
- New functions and components have JSDoc.
- Commit with Conventional Commits: `feat(enrollments): add enroll button`.