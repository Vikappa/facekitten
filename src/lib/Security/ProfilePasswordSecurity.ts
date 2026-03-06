import { compare, hash } from "bcrypt";

const PASSWORD_HASH_SALT_ROUNDS = 12;

export const normalizeEmail = (email?: string): string | undefined => email?.trim().toLowerCase();

export async function hashProfilePassword(plainPassword: string): Promise<string> {
  return hash(plainPassword, PASSWORD_HASH_SALT_ROUNDS);
}

export async function verifyProfilePassword(
  plainPassword: string,
  passwordHash: string
): Promise<boolean> {
  if (passwordHash.startsWith("$2")) {
    return compare(plainPassword, passwordHash);
  }

  if (passwordHash.startsWith("$argon2")) {
    try {
      const argon2 = await import("argon2");
      return argon2.verify(passwordHash, plainPassword);
    } catch {
      return false;
    }
  }

  return false;
}
