export { cn } from "cn"
export const PASSWORD_RULES = [
  {
    id: "length",
    label: "At least 6 characters",
    test: (value: string) => value.length >= 6,
  },
  {
    id: "uppercase",
    label: "One uppercase letter (A–Z)",
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    id: "lowercase",
    label: "One lowercase letter (a–z)",
    test: (value: string) => /[a-z]/.test(value),
  },
] as const;

export type PasswordCheck = {
  id: string;
  label: string;
  met: boolean;
};

export function checkPassword(password: string): PasswordCheck[] {
  return PASSWORD_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    met: rule.test(password),
  }));
}

export function isPasswordValid(password: string): boolean {
  return checkPassword(password).every((check) => check.met);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}
