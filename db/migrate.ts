import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

config({
  path: ".env.local",
});

const runMigrate = async () => {
  if (!process.env.POSTGRES_URL) {
    throw new Error("POSTGRES_URL is not defined");
  }

  const connection = postgres(process.env.POSTGRES_URL, {
    max: 1,
    ssl: "require", // Force SSL mode without custom CA cert
  });

  const db = drizzle(connection);

  console.log("⏳ Running migrations...");

  try {
    const start = Date.now();
    await migrate(db, { migrationsFolder: "./lib/drizzle" });
    const end = Date.now();
    console.log("✅ Migrations completed in", end - start, "ms");
  } catch (error) {
    console.error("❌ Migration failed");
    console.error(error);
  } finally {
    await connection.end();
    process.exit(0);
  }
};

runMigrate().catch((err) => {
  console.error("❌ Migration failed");
  console.error(err);
  process.exit(1);
});
