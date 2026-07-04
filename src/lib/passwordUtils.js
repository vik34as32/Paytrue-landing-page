const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWER = "abcdefghjkmnpqrstuvwxyz";
const DIGITS = "23456789";
const SPECIAL = "@#$%&*!";

function pick(chars) {
  return chars[Math.floor(Math.random() * chars.length)];
}

function shuffle(str) {
  const arr = str.split("");
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("");
}

/** Exactly 8 chars with upper, lower, digit, special */
export function generateSecurePassword() {
  const required = [
    pick(UPPER),
    pick(LOWER),
    pick(DIGITS),
    pick(SPECIAL),
  ];
  const pool = UPPER + LOWER + DIGITS + SPECIAL;
  while (required.length < 8) {
    required.push(pick(pool));
  }
  return shuffle(required.join("")).slice(0, 8);
}

export const PASSWORD_RULES = {
  length: 8,
  upper: /[A-Z]/,
  lower: /[a-z]/,
  digit: /\d/,
  special: /[^A-Za-z0-9]/,
};

export function isValidGeneratedPassword(value) {
  if (!value || value.length !== 8) return false;
  return (
    PASSWORD_RULES.upper.test(value) &&
    PASSWORD_RULES.lower.test(value) &&
    PASSWORD_RULES.digit.test(value) &&
    PASSWORD_RULES.special.test(value)
  );
}
