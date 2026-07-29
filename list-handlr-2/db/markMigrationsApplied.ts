/**
 * One-time fix script: marks already-applied migrations as done in the
 * drizzle.__drizzle_migrations table so that drizzle migrate won't try to
 * re-run SQL that already executed on the Neon DB.
 *
 * Run with:  npx tsx ./db/markMigrationsApplied.ts
 */
import "dotenv/config";
import { createHash } from "crypto";
import { readFileSync } from "fs";
import { join } from "path";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

const migrationsFolder = join(process.cwd(), "db", "migrations");

// Migrations already in the Neon DB but not recorded in drizzle.__drizzle_migrations.
// created_at values come from the "when" field in db/migrations/meta/_journal.json.
const alreadyApplied = [
  { filename: "0002_lovely_madelyne_pryor.sql",    createdAt: 1760345855908 },
  { filename: "0003_marvelous_otto_octavius.sql",   createdAt: 1785234799820 },
];

async function main() {
  // Ensure the drizzle schema and table exist
  await sql`CREATE SCHEMA IF NOT EXISTS drizzle`;
  await sql`
    CREATE TABLE IF NOT EXISTS drizzle."__drizzle_migrations" (
      id serial PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `;

  for (const { filename, createdAt } of alreadyApplied) {
    const content = readFileSync(join(migrationsFolder, filename), "utf-8");
    const hash = createHash("sha256").update(content).digest("hex");

    const existing = await sql`
      SELECT id FROM drizzle."__drizzle_migrations" WHERE created_at = ${createdAt}
    `;

    if (existing.length > 0) {
      console.log(`✓ Already recorded: ${filename}`);
    } else {
      await sql`
        INSERT INTO drizzle."__drizzle_migrations" (hash, created_at)
        VALUES (${hash}, ${createdAt})
      `;
      console.log(`✓ Marked as applied: ${filename} (created_at=${createdAt})`);
    }
  }

  console.log("\nDone. You can now run: npm run db:migrate");
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
