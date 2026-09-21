interface WidgetProps {
  disabled?: boolean;
  title: string;
  value?: string;
}

export function SpreadWidget({ disabled, title, value, ...props }: WidgetProps & Record<string, unknown>) {
  return <section title={title} value={value} {...props} disabled={disabled} />;
}
