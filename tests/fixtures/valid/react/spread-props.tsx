interface FieldProps {
  className?: string;
  value: string;
}

export function Field(props: FieldProps) {
  return <input value={props.value} {...props} disabled />;
}
