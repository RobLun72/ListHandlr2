import "dotenv/config";
import { db } from "./index";
import { migrate } from "drizzle-orm/neon-http/migrator";

const main = async () => {
  try {
    await migrate(db, {
      migrationsFolder: "./db/migrations",
    });
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

main();
