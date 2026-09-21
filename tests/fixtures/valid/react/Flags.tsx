interface FlagProps {
  once?: boolean;
  online?: boolean;
  only?: boolean;
  value: string;
}

export function Flags({ once, online, only, value }: FlagProps) {
  return <span data-once={once} data-online={online} data-only={only} data-value={value} />;
}
