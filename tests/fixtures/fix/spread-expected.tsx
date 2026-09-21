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
  return <input value={value} onChange={onChange} {...props} disabled className={className} />;
}
