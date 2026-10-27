interface PlaceholderPageProps {
  /** Spanish page title shown to the user. */
  title: string
}

/**
 * Temporary screen for routes whose feature is not built yet.
 */
export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-4xl font-bold tracking-tight text-ink">{title}</h1>
      <p className="text-ink-muted">Esta sección estará disponible pronto.</p>
    </section>
  )
}
