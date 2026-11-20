import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { adminUsers, type AdminUser } from "@/db/schema";

export const SESSION_COOKIE = "kp_admin";
const SESSION_DAYS = 30;

export type Session = { userId: string; email: string; name: string; role: "owner" | "florist"; storeId: string | null };

function secretKey(): Uint8Array {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET není nastavený.");
    return new TextEncoder().encode("dev-only-secret-dev-only-secret-dev-only");
  }
  return new TextEncoder().encode(s);
}

export async function signSession(s: Session): Promise<string> {
  return new SignJWT({ ...s })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(s.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secretKey());
}

export async function verifySessionToken(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (!payload.sub || typeof payload.email !== "string") return null;
    return {
      userId: payload.sub,
      email: payload.email,
      name: String(payload.name ?? ""),
      role: payload.role === "owner" ? "owner" : "florist",
      storeId: typeof payload.storeId === "string" ? payload.storeId : null,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/** Pro server actions a stránky adminu: vrátí session nebo přesměruje na přihlášení. */
export async function requireAdmin(): Promise<Session> {
  const s = await getSession();
  if (!s) redirect("/admin/prihlaseni");
  return s;
}

export async function requireOwner(): Promise<Session> {
  const s = await requireAdmin();
  if (s.role !== "owner") throw new Error("Tuto akci může provést jen majitelka.");
  return s;
}

export async function setSessionCookie(s: Session) {
  const token = await signSession(s);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 3600,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, 11);
}

export async function verifyPassword(pw: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pw, hash);
}

// Jednoduchý limit pokusů o přihlášení na instanci (5 pokusů za 10 minut na e-mail).
const attempts = new Map<string, { n: number; until: number }>();
export function loginAllowed(email: string): boolean {
  const now = Date.now();
  const a = attempts.get(email);
  if (!a || a.until < now) return true;
  return a.n < 5;
}
export function recordLoginFailure(email: string) {
  const now = Date.now();
  const a = attempts.get(email);
  if (!a || a.until < now) attempts.set(email, { n: 1, until: now + 10 * 60_000 });
  else a.n += 1;
}
export function clearLoginFailures(email: string) {
  attempts.delete(email);
}

export async function findAdminByEmail(email: string): Promise<AdminUser | undefined> {
  const db = await getDb();
  const rows = await db.select().from(adminUsers).where(eq(adminUsers.email, email.toLowerCase().trim()));
  return rows[0];
}

export function sessionFromUser(u: AdminUser): Session {
  return { userId: u.id, email: u.email, name: u.name, role: u.role, storeId: u.defaultStoreId };
}
