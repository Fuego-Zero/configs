import fs from "fs";

export function firstAdmin(users) {
  return users.filter(user => user.role === "admin")[0];
}

export function containsAdmin(roles) {
  return roles.indexOf("admin") !== -1;
}

export function isApiPath() {
  const value = "/api/users";

  return value.indexOf("/api/") === 0;
}

export function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}
