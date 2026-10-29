export function Missing({ count }: { count: number }) {
  return <div>{count ? <span>{count}</span> : null}</div>;
}
