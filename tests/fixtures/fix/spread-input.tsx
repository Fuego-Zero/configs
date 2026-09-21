export function Field({
  className,
  onChange,
  value,
  ...props
}: {
  className?: string;
  onChange?: () => void;
  value: string;
}) {
  return <input onChange={onChange} value={value} {...props} className={className} disabled />;
}
