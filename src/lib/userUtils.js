export function getUserDisplayName(user, fallback = "—") {
  if (!user) return fallback;
  if (typeof user === "string") return user;
  if (typeof user.name === "string" && user.name.trim()) return user.name.trim();
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  if (fullName) return fullName;
  if (user.email) return String(user.email);
  if (user.userId) return String(user.userId);
  if (user.id) return String(user.id);
  return fallback;
}
