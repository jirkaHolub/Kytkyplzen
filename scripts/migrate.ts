// Spustí migrace proti DATABASE_URL (Postgres). Lokální PGlite migruje automaticky při startu.
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Chybí DATABASE_URL");
  const client = postgres(url, { max: 1 });
  const db = drizzle(client);
  await migrate(db, { migrationsFolder: "./drizzle" });
  await client.end();
  console.log("Migrace hotové.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
