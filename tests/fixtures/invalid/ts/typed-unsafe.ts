export function typedUnsafeExamples(payload: any) {
  const user = payload.user;
  const copy = ("hello" as string).toUpperCase();

  greet(payload);
  user();

  return {
    copy,
    payload,
    user,
  };
}

function greet(name: string) {
  return name;
}

export function wrap(value: any): string {
  return value;
}

export function copy(value: string) {
  return value as string;
}

