import type { ReactNode } from "react";

interface SlotProps {
  icon: ReactNode;
}

interface NullBranchesProps {
  hint?: string;
  ids: number[];
  ready: boolean;
  renderSlot: (slot: ReactNode) => ReactNode;
}

function Slot({ icon }: SlotProps) {
  return <span>{icon}</span>;
}

export function Status({ ready }: { ready: boolean }) {
  return ready ? <span>ready</span> : null;
}

export function NullBranches({ hint, ids, ready, renderSlot }: NullBranchesProps) {
  const badge = ready ? <b>ready</b> : null;
  const label = hint ? hint.trim() : null;

  return (
    <section>
      <Slot icon={ready ? <i>icon</i> : null} />
      {badge}
      {label}
      {renderSlot(ready ? <i>slot</i> : null)}
      {ids.map(id => (id > 1 ? <em key={id}>{id}</em> : null))}
    </section>
  );
}
