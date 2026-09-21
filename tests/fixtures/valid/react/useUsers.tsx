import { useState } from "react";

import type { User } from "../ts/models.js";

export function useUsers() {
  const [users] = useState<User[]>([]);

  return users;
}
