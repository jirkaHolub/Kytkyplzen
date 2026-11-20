"use server";

import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { databaseMode, getDb } from "@/db";
import { adminUsers } from "@/db/schema";
import { seedDatabase } from "@/db/seed";
import {
  clearLoginFailures,
  clearSessionCookie,
  findAdminByEmail,
  hashPassword,
  loginAllowed,
  recordLoginFailure,
  requireOwner,
  sessionFromUser,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";
import { writeAudit } from "@/lib/audit";

export type ActionState = { error?: string; ok?: string; email?: string } | null;

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1), zpet: z.string().optional() });

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? "").toLowerCase().trim(),
    password: String(formData.get("password") ?? ""),
    zpet: String(formData.get("zpet") ?? ""),
  });
  if (!parsed.success) return { error: "Zadejte e-mail a heslo.", email: String(formData.get("email") ?? "") };
  const { email, password } = parsed.data;
  if (!loginAllowed(email)) return { error: "Příliš mnoho pokusů. Zkuste to za 10 minut.", email };
  const user = await findAdminByEmail(email);
  if (!user || !user.active || !(await verifyPassword(password, user.passwordHash))) {
    recordLoginFailure(email);
    return { error: "Nesprávný e-mail nebo heslo.", email };
  }
  clearLoginFailures(email);
  const db = await getDb();
  await db.update(adminUsers).set({ lastLoginAt: new Date() }).where(eq(adminUsers.id, user.id));
  await setSessionCookie(sessionFromUser(user));
  const back = parsed.data.zpet && parsed.data.zpet.startsWith("/admin") ? parsed.data.zpet : "/admin/nabidka";
  redirect(back);
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/admin/prihlaseni");
}

/** Spustí SQL migrace proti Postgresu. PGlite migruje při startu samo. */
export async function runMigrations(): Promise<void> {
  if (databaseMode() !== "postgres") return;
  const db = await getDb();
  const { migrate } = await import("drizzle-orm/postgres-js/migrator");
  const path = await import("node:path");
  await migrate(db as never, { migrationsFolder: path.join(process.cwd(), "drizzle") });
}

const setupSchema = z.object({
  name: z.string().min(2, "Zadejte jméno."),
  email: z.string().email("Zadejte platný e-mail."),
  password: z.string().min(8, "Heslo musí mít aspoň 8 znaků."),
});

/** První spuštění: migrace, ukázková data a účet majitelky. Funguje jen dokud neexistuje žádný admin. */
export async function setupAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = setupSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").toLowerCase().trim(),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Zkontrolujte údaje." };
  try {
    await runMigrations();
    const db = await getDb();
    const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(adminUsers);
    if (Number(n) > 0) return { error: "Účet už existuje, přihlaste se." };
    const seedWanted = formData.get("seed") === "on";
    if (seedWanted) await seedDatabase(db);
    const [user] = await db
      .insert(adminUsers)
      .values({ name: parsed.data.name, email: parsed.data.email, role: "owner", passwordHash: await hashPassword(parsed.data.password) })
      .returning();
    const session = sessionFromUser(user);
    await writeAudit(db, session, { action: "setup", entity: "system", after: { seed: seedWanted } });
    await setSessionCookie(session);
  } catch (e) {
    return { error: `Nastavení se nepovedlo: ${e instanceof Error ? e.message : String(e)}` };
  }
  redirect("/admin/nabidka?zprava=Vítejte, účet je založený.");
}

export async function migrateAction(): Promise<void> {
  const session = await requireOwner();
  await runMigrations();
  const db = await getDb();
  await writeAudit(db, session, { action: "migrate", entity: "system" });
  redirect("/admin/nastaveni?zprava=Databáze je aktuální.");
}

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["owner", "florist"]),
  storeId: z.string().optional(),
});

export async function createAdminUserAction(formData: FormData): Promise<void> {
  const session = await requireOwner();
  const parsed = userSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").toLowerCase().trim(),
    password: String(formData.get("password") ?? ""),
    role: String(formData.get("role") ?? "florist"),
    storeId: String(formData.get("storeId") ?? "") || undefined,
  });
  if (!parsed.success) redirect("/admin/nastaveni?chyba=Zkontrolujte jméno, e-mail a heslo (min. 8 znaků).");
  const db = await getDb();
  const [u] = await db
    .insert(adminUsers)
    .values({
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      passwordHash: await hashPassword(parsed.data.password),
      defaultStoreId: parsed.data.storeId ?? null,
    })
    .returning();
  await writeAudit(db, session, { action: "create", entity: "admin_user", entityId: u.id, after: { email: u.email, role: u.role } });
  redirect("/admin/nastaveni?zprava=Uživatel přidán.");
}

export async function toggleAdminUserAction(formData: FormData): Promise<void> {
  const session = await requireOwner();
  const id = String(formData.get("id") ?? "");
  if (id === session.userId) redirect("/admin/nastaveni?chyba=Vlastní účet nelze deaktivovat.");
  const db = await getDb();
  const [u] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
  if (!u) redirect("/admin/nastaveni");
  await db.update(adminUsers).set({ active: !u.active }).where(eq(adminUsers.id, id));
  await writeAudit(db, session, { action: u.active ? "deactivate" : "activate", entity: "admin_user", entityId: id });
  redirect("/admin/nastaveni");
}
