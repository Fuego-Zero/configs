import { saveUser } from "./user-service.js";

export async function saveDefaultUser() {
  const user = {
    age: 18,
    id: "1",
    name: "Tom",
  };

  await saveUser(user);
}
