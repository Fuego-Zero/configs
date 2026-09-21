import type { User } from "../ts/models.js";

interface UserCardProps {
  onSelect?: (user: User) => void;
  selected?: boolean;
  user: User;
}

export function UserCard({ selected, user, onSelect }: UserCardProps) {
  return (
    <button type="button" aria-pressed={selected} data-user-id={user.id} onClick={() => onSelect?.(user)}>
      {user.name}
    </button>
  );
}
