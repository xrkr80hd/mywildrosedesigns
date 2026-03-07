export const ADMIN_SESSION_COOKIE = "wr_admin_session";

export function encodeAdminSession(username: string, password: string): string {
  const raw = `${username}:${password}`;

  if (typeof btoa === "function") {
    return btoa(raw);
  }

  return Buffer.from(raw, "utf8").toString("base64");
}

