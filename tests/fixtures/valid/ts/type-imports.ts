import { createUser, type User } from "./user-service.js";

export function buildDefaultUser(): User {
  return createUser("1", "Tom");
}
