export function buildUser(id, name) {
  return {
    id,
    name,
  };
}

export function hasOwn(object, key) {
  return Object.hasOwn(object, key);
}
