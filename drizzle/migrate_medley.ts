import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("Adding is_medley column to playlist_songs table...");
  await sql`
    ALTER TABLE playlist_songs 
    ADD COLUMN IF NOT EXISTS is_medley BOOLEAN DEFAULT false;
  `;
  console.log("Migration completed successfully!");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
