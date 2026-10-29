interface PanelProps {
  count: number;
  items: string[];
  open?: boolean;
  ready: boolean;
}

export function Panel({ count, items, open, ready }: PanelProps) {
  return (
    <section>
      {ready ? <span>ok</span> : null}
      {open ? <span>open</span> : null}
      {ready ? null : <span>waiting</span>}
      {items.length ? <span>{items.length}</span> : null}
      {ready || items.length > 0 ? <span>either</span> : null}
      {count > 1 ? null : <span>single</span>}
      {count ? <span>{count}</span> : null}
      {ready ? (
        <div>
          <span>multi</span>
        </div>
      ) : null}
    </section>
  );
}
