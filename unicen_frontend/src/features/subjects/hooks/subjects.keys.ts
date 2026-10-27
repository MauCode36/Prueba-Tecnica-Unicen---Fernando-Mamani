/** Centralized TanStack Query keys for the subjects feature. */
export const subjectsKeys = {
  all: ['subjects'] as const,
  list: () => [...subjectsKeys.all, 'list'] as const,
}
