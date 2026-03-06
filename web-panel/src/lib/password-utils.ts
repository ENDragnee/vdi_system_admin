import { hash, compare, genSalt } from "bcrypt";

export async function hash_password(password: string): Promise<string> {
  const saltRound = Number(process.env.ROUND_SALT);

  if (!saltRound || Number.isNaN(saltRound)) {
    throw new Error(
      "ROUND_SALT has not been loaded or it is not a vaild number",
    );
  }
  const salt = await genSalt(saltRound);

  return await hash(password, salt);
}

export async function validate_password(
  password: string,
  hashed_password: string,
): Promise<boolean> {
  return await compare(password, hashed_password);
}

console.log(hash_password("12345678"));
