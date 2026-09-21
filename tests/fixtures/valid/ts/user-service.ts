import type { User } from "./models.js";

export function createUser(id: string, name: string): User {
  return {
    age: 18,
    id,
    name,
  };
}

export function saveUser(user: User): Promise<User> {
  return Promise.resolve(user);
}
