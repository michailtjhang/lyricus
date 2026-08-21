import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("Adding Holy Communion tag to tags table...");
  await sql`
    INSERT INTO tags (id, name, category)
    VALUES (gen_random_uuid(), 'Holy Communion', 'THEME')
    ON CONFLICT (name) DO NOTHING;
  `;
  console.log("Tag Holy Communion migration completed successfully!");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
