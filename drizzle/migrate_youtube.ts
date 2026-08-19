import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("Running safe database migration for youtube_url...");
  await sql`ALTER TABLE songs ADD COLUMN IF NOT EXISTS youtube_url VARCHAR(500);`;
  console.log("✅ Column youtube_url added successfully! Existing data is completely intact.");
}

main().catch(console.error);
