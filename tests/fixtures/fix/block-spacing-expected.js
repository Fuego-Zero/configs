export function summarize(values) {
  let total = 0;
  for (const value of values) {
    if (value < 0) {
      continue;
    }

    total += value;
  }

  if (total === 0) {
    return "empty";
  }

  return String(total);
}

export function describeStatus(status) {
  let label;
  if (status === "enabled") {
    label = "active";
  } else {
    label = "inactive";
  }

  return label;
}
