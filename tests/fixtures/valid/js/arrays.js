export function findActiveUser(users) {
  return users.find(user => user.active);
}

export function hasAdminRole(roles) {
  return roles.includes("admin");
}
