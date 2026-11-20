// Nahraje ukázková data do DATABASE_URL (Postgres). Nic nedělá, když už existují prodejny.
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";
import { seedDatabase } from "../src/db/seed";
import type { Db } from "../src/db";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Chybí DATABASE_URL");
  const client = postgres(url, { max: 1 });
  const db = drizzle(client, { schema }) as unknown as Db;
  const r = await seedDatabase(db);
  await client.end();
  console.log(r.seeded ? "Ukázková data nahraná." : "Data už existují, nic se nenahrálo.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
