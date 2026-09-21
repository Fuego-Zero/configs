import { useMemo } from "react";

import { UserList } from "./UserList.js";
import { useUsers } from "./useUsers.js";

export function UserPage() {
  const users = useUsers();
  const activeUsers = useMemo(() => users.filter(user => user.age >= 18), [users]);

  return <UserList users={activeUsers} />;
}
