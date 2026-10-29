interface PanelProps {
  count: number;
  items: string[];
  open?: boolean;
  ready: boolean;
}

export function Panel({ count, items, open, ready }: PanelProps) {
  return (
    <section>
      {ready && <span>ok</span>}
      {open && <span>open</span>}
      {!ready && <span>waiting</span>}
      {items.length > 0 && <span>{items.length}</span>}
      {(ready || items.length > 0) && <span>either</span>}
      {!(count > 1) && <span>single</span>}
      {count ? <span>{count}</span> : null}
      {ready && (
        <div>
          <span>multi</span>
        </div>
      )}
    </section>
  );
}
