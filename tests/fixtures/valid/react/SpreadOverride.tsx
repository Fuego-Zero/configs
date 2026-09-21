export function SpreadOverride(props: { disabled?: boolean; value?: string }) {
  const value = "kept";

  return <button value={value} {...props} disabled />;
}
