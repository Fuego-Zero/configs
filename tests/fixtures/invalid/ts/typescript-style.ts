export interface BadOrder {
  item10: string;
  alpha: string;
  item2: string;
}

interface Box {
  inner?: { value: string };
}

export function styleExamples(value: string | undefined, items: Array<string>, box: Box) {
  const count: number = 1;
  const unusedLabel = "demo";
  const first = items && items[0];
  const nested = box.inner && box.inner.value;
  const fallback = value != null ? value : "none";
  const boxed: String = "label";

  return {
    boxed,
    count,
    fallback,
    first,
    nested,
  };
}
