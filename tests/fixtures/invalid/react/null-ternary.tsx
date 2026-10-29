export function Missing({ ready }: { ready: boolean }) {
  return ready ? <span>ready</span> : null;
}
