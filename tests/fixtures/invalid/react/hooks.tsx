import { useEffect, useState } from "react";

export function ConditionalCounter({ enabled }: { enabled: boolean }) {
  if (enabled) {
    const [count, setCount] = useState(0);

    useEffect(() => {
      setCount(1);
    }, []);

    return <div>{count}</div>;
  }

  return null;
}

export function RenderSetState() {
  const [value, setValue] = useState(0);
  setValue(value + 1);

  return <div>{value}</div>;
}
