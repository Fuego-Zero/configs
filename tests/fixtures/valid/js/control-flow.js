export function normalizeStatus(status) {
  if (status === null) {
    return "unknown";
  }

  return status === "enabled" ? "active" : status;
}
