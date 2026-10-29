export function Panel({ ready, items }: { ready: boolean; items: string[] }) {
  const value = ready ? [ready] : null;

  return (
    <section>
      {ready && <span>ok</span>}
      {items.length > 0 && <span>{items.length}</span>}
      {(ready || items.length > 0) && <span>either</span>}
      {value}
    </section>
  );
}
