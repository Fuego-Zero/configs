import { saveUser } from "../../valid/ts/user-service.js";

export function submit() {
  saveUser({
    age: 18,
    id: "1",
    name: "Tom",
  });
}

export async function waitForNumber() {
  const value = await 123;

  return value;
}

export async function loadCount() {
  return 1;
}

export function rejectOops() {
  return Promise.reject("oops");
}
