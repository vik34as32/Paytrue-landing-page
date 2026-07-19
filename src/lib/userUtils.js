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

/**
 * Retailer-facing display name — never shows last name.
 * Prefers firstName; strips trailing lastName from a full `name` if needed.
 */
export function getRetailerDisplayName(user, fallback = "Retailer") {
  if (!user) return fallback;
  if (typeof user === "string") return user.trim() || fallback;

  const firstName = String(user.firstName || "").trim();
  if (firstName) return firstName;

  const lastName = String(user.lastName || "").trim();
  const fullName = String(user.name || "").trim();
  if (fullName) {
    if (lastName) {
      const escaped = lastName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const withoutLast = fullName
        .replace(new RegExp(`\\s+${escaped}$`, "i"), "")
        .trim();
      if (withoutLast) return withoutLast;
    }
    const parts = fullName.split(/\s+/).filter(Boolean);
    if (parts.length > 1) return parts.slice(0, -1).join(" ");
    return fullName;
  }

  if (user.email) return String(user.email);
  if (user.userCode) return String(user.userCode);
  if (user.userId) return String(user.userId);
  return fallback;
}
