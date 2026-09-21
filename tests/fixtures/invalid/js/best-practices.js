export function bestPracticeExamples(object) {
  const name = object.name;

  if (object.ok) {
    return name;
  } else {
    return "missing";
  }
}

export function nested(value) {
  return value ? (value > 1 ? "big" : "small") : "empty";
}

export function parse(value) {
  return parseInt(value);
}

export function shout() {
  alert("hi");
}

export function switcher(value) {
  switch (value) {
    case 1:
      return "one";
  }

  return "other";
}

export async function serial(items) {
  const result = [];

  for (const item of items) {
    result.push(await Promise.resolve(item));
  }

  return result;
}

export function wrappers() {
  return new String("x");
}

export function evil() {
  return eval("1 + 1");
}
