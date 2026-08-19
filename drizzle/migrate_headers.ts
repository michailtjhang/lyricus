import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("Running safe database migration for playlist headers/dividers...");
  await sql`ALTER TABLE playlist_songs ALTER COLUMN song_id DROP NOT NULL;`;
  await sql`ALTER TABLE playlist_songs ADD COLUMN IF NOT EXISTS header_label VARCHAR(255);`;
  console.log("✅ Database columns updated successfully! Existing data is completely safe.");
}

main().catch(console.error);
