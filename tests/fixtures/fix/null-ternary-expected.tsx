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
      {ready && <span>ok</span>}
      {open && <span>open</span>}
      {error && <span>{error.message}</span>}
      {onClose && (
        <button type="button" onClick={onClose}>
          close
        </button>
      )}
      {!ready && <span>waiting</span>}
      {mode !== "edit" && <span>read only</span>}
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
