import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "./schema";

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

// Postgres přes DATABASE_URL (Neon na Vercelu). Bez DATABASE_URL se lokálně použije PGlite
// (embedded Postgres) v adresáři .data, aby šel web spustit bez externí databáze.
// Na Vercelu bez DATABASE_URL se databáze nepoužije a admin ukáže návod k napojení.

type Mode = "postgres" | "pglite" | "none";

export function databaseMode(): Mode {
  if (process.env.DATABASE_URL) return "postgres";
  if (process.env.VERCEL) return "none";
  return "pglite";
}

export function hasDatabase(): boolean {
  return databaseMode() !== "none";
}

const globalForDb = globalThis as unknown as { __kpDb?: Promise<Db> };

export function getDb(): Promise<Db> {
  if (!globalForDb.__kpDb) globalForDb.__kpDb = createDb();
  return globalForDb.__kpDb;
}

async function createDb(): Promise<Db> {
  const mode = databaseMode();
  if (mode === "postgres") {
    const { drizzle } = await import("drizzle-orm/postgres-js");
    const postgres = (await import("postgres")).default;
    const client = postgres(process.env.DATABASE_URL!, { max: 5, prepare: false });
    return drizzle(client, { schema }) as unknown as Db;
  }
  if (mode === "pglite") {
    const { PGlite } = await import("@electric-sql/pglite");
    const { drizzle } = await import("drizzle-orm/pglite");
    const path = await import("node:path");
    const fs = await import("node:fs/promises");
    const dir = path.join(process.cwd(), ".data", "pglite");
    await fs.mkdir(dir, { recursive: true });
    const client = new PGlite(dir);
    const db = drizzle(client, { schema }) as unknown as Db;
    const { migrate } = await import("drizzle-orm/pglite/migrator");
    await migrate(db as never, { migrationsFolder: path.join(process.cwd(), "drizzle") });
    return db;
  }
  throw new Error("Databáze není nastavená (chybí DATABASE_URL).");
}

export { schema };
