/** Placeholder last name for retailer onboarding when backend requires both fields */
export function generatePlaceholderLastName() {
  return `R${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export function resolveRetailerNameFields(values = {}) {
  const fullName = String(values.fullName || values.firstName || "").trim();
  const existingLastName = String(values.lastName || "").trim();

  return {
    firstName: fullName,
    lastName: existingLastName || generatePlaceholderLastName(),
  };
}
