export function languageExamples(value, object) {
  debugger;

  var count = 0;
  const unusedName = "Tom";

  if (value) console.log(value);

  if (value == 0) {
    count += 1;
  }

  let frozen = 1;
  count++;

  if (value) {
  }

  const message = "Hello, " + String(value);
  const wrapped = { value: value };
  const cloned = Object.assign({}, object);
  const owned = Object.prototype.hasOwnProperty.call(object, "id");

  if (value === NaN) {
    return frozen;
  }
  return {
    cloned,
    count,
    message,
    owned,
    wrapped,
  };
}
