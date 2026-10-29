export function Panel({ ready, items }: { ready: boolean; items: string[] }) {
  const value = ready ? [ready] : null;

  return (
    <section>
      {ready ? <span>ok</span> : null}
      {items.length ? <span>{items.length}</span> : null}
      {ready || items.length > 0 ? <span>either</span> : null}
      {value}
    </section>
  );
}
