import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

function getSecret() {
  const key = process.env.ADMIN_JWT_SECRET;
  if (!key) throw new Error("ADMIN_JWT_SECRET is not set");
  return new TextEncoder().encode(key);
}
const COOKIE_NAME = "nick-admin-token";

export async function signToken(username: string) {
  return new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as { username: string };
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export { COOKIE_NAME };
