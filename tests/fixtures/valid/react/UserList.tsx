import type { User } from "../ts/models.js";
import { UserCard } from "./UserCard.js";

interface UserListProps {
  onSelect?: (user: User) => void;
  users: readonly User[];
}

export function UserList({ users, onSelect }: UserListProps) {
  return (
    <div>
      {users.map(user => (
        <UserCard key={user.id} user={user} onSelect={onSelect} />
      ))}
    </div>
  );
}
