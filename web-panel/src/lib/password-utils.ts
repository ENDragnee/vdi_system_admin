import { hash, compare, genSalt } from "bcrypt";

/**
 * Hashes a plaintext password using bcrypt with a salt generated from the configured ROUND_SALT.
 * 
 * @param password - The plaintext password to be hashed.
 * @returns A promise that resolves to the hashed password string.
 * @throws An error if ROUND_SALT is missing or invalid in the environment variables.
 */
export async function hash_password(password: string): Promise<string> {
  const saltRound = Number(process.env.ROUND_SALT);

  if (!saltRound || Number.isNaN(saltRound)) {
    throw new Error(
      "ROUND_SALT has not been loaded or it is not a valid number in the environment config.",
    );
  }
  const salt = await genSalt(saltRound);

  return await hash(password, salt);
}

/**
 * Validates a plaintext password against an existing hashed password.
 * 
 * @param password - The plaintext password attempt.
 * @param hashed_password - The known valid bcrypt hashed password.
 * @returns A promise that resolves to a boolean indicating whether the password is valid.
 */
export async function validate_password(
  password: string,
  hashed_password: string,
): Promise<boolean> {
  return await compare(password, hashed_password);
}

