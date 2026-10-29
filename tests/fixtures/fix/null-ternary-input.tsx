interface PanelProps {
  count: number;
  error: Error | null;
  items: string[];
  mode: "edit" | "view";
  onClose?: () => void;
  open?: boolean;
  ready: boolean;
}

export function Panel({ count, error, items, mode, open, ready, onClose }: PanelProps) {
  return (
    <section>
      {ready ? <span>ok</span> : null}
      {open ? <span>open</span> : null}
      {error ? <span>{error.message}</span> : null}
      {onClose ? (
        <button type="button" onClick={onClose}>
          close
        </button>
      ) : null}
      {ready ? null : <span>waiting</span>}
      {mode === "edit" ? null : <span>read only</span>}
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
