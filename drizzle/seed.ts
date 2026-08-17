import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as dotenv from "dotenv";
import { songs, lyricSections, tags, songTags, playlists, playlistSongs } from "./schema";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seed() {
  console.log("🌱 Seeding database...");

  console.log("  → Cleaning existing data...");
  await sql.query("TRUNCATE TABLE songs, tags, playlists CASCADE;");


  // ─── Insert Tags ─────────────────────────────────────────────────────────
  console.log("  → Inserting tags...");
  const insertedTags = await db
    .insert(tags)
    .values([
      // GENRE
      { name: "Worship", category: "GENRE" },
      { name: "Praise", category: "GENRE" },
      { name: "Hymn", category: "GENRE" },
      { name: "Contemporary", category: "GENRE" },
      // LANGUAGE
      { name: "Indonesian", category: "LANGUAGE" },
      { name: "English", category: "LANGUAGE" },
      { name: "Bilingual", category: "LANGUAGE" },
      // THEME
      { name: "Slow", category: "THEME" },
      { name: "Upbeat", category: "THEME" },
      { name: "Acoustic", category: "THEME" },
      { name: "Easter", category: "THEME" },
      { name: "Christmas", category: "THEME" },
    ])
    .onConflictDoNothing()
    .returning();

  // Build tag lookup map
  const allTags = insertedTags.length > 0 ? insertedTags : await db.select().from(tags);
  const tagMap: Record<string, string> = {};
  allTags.forEach((t) => { tagMap[t.name] = t.id; });

  // ─── Insert Songs ─────────────────────────────────────────────────────────
  console.log("  → Inserting songs...");

  // 1. Mengenal-Mu - JPCC Worship
  const [mengenalMu] = await db.insert(songs).values({
    title: "Mengenal-Mu",
    slug: "mengenal-mu-jpcc",
    artist: "JPCC Worship",
    album: "JPCC Worship",
    releaseYear: 2014,
    key: "A",
    tempo: 72,
    songFlow: ["Intro", "Verse 1", "Pre-Chorus", "Chorus", "Verse 1", "Pre-Chorus", "Chorus", "Interlude", "Chorus", "Chorus", "Ending"],
  }).returning();

  await db.insert(lyricSections).values([
    {
      songId: mengenalMu.id,
      sectionType: "INTRO",
      sectionLabel: "Intro",
      content: "(Instrumental)",
      orderIndex: 0,
    },
    {
      songId: mengenalMu.id,
      sectionType: "VERSE",
      sectionLabel: "Verse 1",
      content: "Bila kubuka mataku\nDan lihat wajah-Mu\nKu terkagum\nBila kulihat hidupku\nDan karya tangan-Mu\nAku tersanjung",
      orderIndex: 1,
    },
    {
      songId: mengenalMu.id,
      sectionType: "PRE_CHORUS",
      sectionLabel: "Pre-Chorus",
      content: "Kar'na semua yang baik\nDalam hidupku\nItulah karya-Mu\nKau b'ri kesempatan yang baru",
      orderIndex: 2,
    },
    {
      songId: mengenalMu.id,
      sectionType: "CHORUS",
      sectionLabel: "Chorus",
      content: "Dan ku ingin mengenal-Mu, Tuhan\nLebih dalam dari semua yang kukenal\nTiada kasih yang melebihi-Mu\nKu ada untuk menjadi penyembah-Mu",
      orderIndex: 3,
    },
    {
      songId: mengenalMu.id,
      sectionType: "INTERLUDE",
      sectionLabel: "Interlude",
      content: "(Instrumental)",
      orderIndex: 4,
    },
    {
      songId: mengenalMu.id,
      sectionType: "ENDING",
      sectionLabel: "Ending",
      content: "Ku ada untuk menjadi penyembah-Mu\nKu ada untuk menjadi penyembah-Mu",
      orderIndex: 5,
    },
  ]);

  await db.insert(songTags).values([
    { songId: mengenalMu.id, tagId: tagMap["Worship"] },
    { songId: mengenalMu.id, tagId: tagMap["Indonesian"] },
    { songId: mengenalMu.id, tagId: tagMap["Slow"] },
    { songId: mengenalMu.id, tagId: tagMap["Contemporary"] },
  ]);

  // 2. How Great Is Our God - Chris Tomlin
  const [howGreat] = await db.insert(songs).values({
    title: "How Great Is Our God",
    slug: "how-great-is-our-god",
    artist: "Chris Tomlin",
    album: "Arriving",
    releaseYear: 2004,
    key: "G",
    tempo: 75,
    songFlow: ["Verse 1", "Chorus", "Verse 2", "Chorus", "Bridge", "Chorus"],
  }).returning();

  await db.insert(lyricSections).values([
    {
      songId: howGreat.id,
      sectionType: "VERSE",
      sectionLabel: "Verse 1",
      content: "The splendor of the King\nClothed in majesty\nLet all the earth rejoice\nAll the earth rejoice\nHe wraps himself in light\nAnd darkness tries to hide\nAnd trembles at His voice\nTrembles at His voice",
      orderIndex: 0,
    },
    {
      songId: howGreat.id,
      sectionType: "CHORUS",
      sectionLabel: "Chorus",
      content: "How great is our God\nSing with me how great is our God\nAnd all will see how great\nHow great is our God",
      orderIndex: 1,
    },
    {
      songId: howGreat.id,
      sectionType: "VERSE",
      sectionLabel: "Verse 2",
      content: "And age to age He stands\nAnd time is in His hands\nBeginning and the end\nBeginning and the end\nThe Godhead, three in one\nFather, Spirit, Son\nThe Lion and the Lamb\nThe Lion and the Lamb",
      orderIndex: 2,
    },
    {
      songId: howGreat.id,
      sectionType: "BRIDGE",
      sectionLabel: "Bridge",
      content: "Name above all names\nWorthy of all praise\nMy heart will sing\nHow great is our God",
      orderIndex: 3,
    },
  ]);

  await db.insert(songTags).values([
    { songId: howGreat.id, tagId: tagMap["Worship"] },
    { songId: howGreat.id, tagId: tagMap["English"] },
    { songId: howGreat.id, tagId: tagMap["Contemporary"] },
    { songId: howGreat.id, tagId: tagMap["Upbeat"] },
  ]);

  // 3. Amazing Grace
  const [amazingGrace] = await db.insert(songs).values({
    title: "Amazing Grace",
    slug: "amazing-grace",
    artist: "Traditional Hymn",
    album: null,
    releaseYear: 1779,
    key: "G",
    tempo: 65,
    songFlow: ["Verse 1", "Verse 2", "Verse 3", "Verse 4"],
  }).returning();

  await db.insert(lyricSections).values([
    {
      songId: amazingGrace.id,
      sectionType: "VERSE",
      sectionLabel: "Verse 1",
      content: "Amazing grace, how sweet the sound\nThat saved a wretch like me\nI once was lost, but now I'm found\nWas blind, but now I see",
      orderIndex: 0,
    },
    {
      songId: amazingGrace.id,
      sectionType: "VERSE",
      sectionLabel: "Verse 2",
      content: "'Twas grace that taught my heart to fear\nAnd grace my fears relieved\nHow precious did that grace appear\nThe hour I first believed",
      orderIndex: 1,
    },
    {
      songId: amazingGrace.id,
      sectionType: "VERSE",
      sectionLabel: "Verse 3",
      content: "Through many dangers, toils, and snares\nI have already come\n'Tis grace has brought me safe thus far\nAnd grace will lead me home",
      orderIndex: 2,
    },
    {
      songId: amazingGrace.id,
      sectionType: "VERSE",
      sectionLabel: "Verse 4",
      content: "When we've been there ten thousand years\nBright shining as the sun\nWe've no less days to sing God's praise\nThan when we first begun",
      orderIndex: 3,
    },
  ]);

  await db.insert(songTags).values([
    { songId: amazingGrace.id, tagId: tagMap["Hymn"] },
    { songId: amazingGrace.id, tagId: tagMap["English"] },
    { songId: amazingGrace.id, tagId: tagMap["Slow"] },
  ]);

  // 4. Satu Yang Ku Mau - True Worshippers
  const [satuYang] = await db.insert(songs).values({
    title: "Satu Yang Ku Mau",
    slug: "satu-yang-ku-mau",
    artist: "True Worshippers",
    album: "True Worshippers",
    releaseYear: 2003,
    key: "C",
    tempo: 68,
    songFlow: ["Verse 1", "Chorus", "Verse 2", "Chorus", "Bridge", "Chorus"],
  }).returning();

  await db.insert(lyricSections).values([
    {
      songId: satuYang.id,
      sectionType: "VERSE",
      sectionLabel: "Verse 1",
      content: "Satu yang ku mau\nTinggal dalam rumah-Mu\nSeumur hidupku\nMenatap wajah-Mu",
      orderIndex: 0,
    },
    {
      songId: satuYang.id,
      sectionType: "CHORUS",
      sectionLabel: "Chorus",
      content: "Tiada yang lain yang ku inginkan\nSelain hadir-Mu ya Tuhan\nKuserahkan hidupku pada-Mu\nBiarkan kasih-Mu melimpah",
      orderIndex: 1,
    },
    {
      songId: satuYang.id,
      sectionType: "VERSE",
      sectionLabel: "Verse 2",
      content: "Satu yang ku mau\nMengalami kasih-Mu\nSetiap hariku\nBerjalan bersama-Mu",
      orderIndex: 2,
    },
    {
      songId: satuYang.id,
      sectionType: "BRIDGE",
      sectionLabel: "Bridge",
      content: "Hanya Engkau yang ku sembah\nHanya Engkau yang ku cinta\nHanya Engkau sumber hidupku\nSelama-lamanya",
      orderIndex: 3,
    },
  ]);

  await db.insert(songTags).values([
    { songId: satuYang.id, tagId: tagMap["Worship"] },
    { songId: satuYang.id, tagId: tagMap["Indonesian"] },
    { songId: satuYang.id, tagId: tagMap["Slow"] },
    { songId: satuYang.id, tagId: tagMap["Contemporary"] },
  ]);

  // 5. Oceans (Where Feet May Fail) - Hillsong UNITED
  const [oceans] = await db.insert(songs).values({
    title: "Oceans (Where Feet May Fail)",
    slug: "oceans-where-feet-may-fail",
    artist: "Hillsong UNITED",
    album: "Zion",
    releaseYear: 2013,
    key: "D",
    tempo: 68,
    songFlow: ["Verse 1", "Pre-Chorus", "Chorus", "Verse 2", "Pre-Chorus", "Chorus", "Bridge", "Chorus"],
  }).returning();

  await db.insert(lyricSections).values([
    {
      songId: oceans.id,
      sectionType: "VERSE",
      sectionLabel: "Verse 1",
      content: "You call me out upon the waters\nThe great unknown where feet may fail\nAnd there I find You in the mystery\nIn oceans deep, my faith will stand",
      orderIndex: 0,
    },
    {
      songId: oceans.id,
      sectionType: "PRE_CHORUS",
      sectionLabel: "Pre-Chorus",
      content: "And I will call upon Your name\nAnd keep my eyes above the waves\nWhen oceans rise\nMy soul will rest in Your embrace\nFor I am Yours and You are mine",
      orderIndex: 1,
    },
    {
      songId: oceans.id,
      sectionType: "CHORUS",
      sectionLabel: "Chorus",
      content: "Your grace abounds in deepest waters\nYour sovereign hand will be my guide\nWhere feet may fail and fear surrounds me\nYou've never failed and You won't start now",
      orderIndex: 2,
    },
    {
      songId: oceans.id,
      sectionType: "VERSE",
      sectionLabel: "Verse 2",
      content: "Your voice I hear among the storm\nYour love, it holds me fast\nWhen all around me fades away\nYou're the anchor of my soul",
      orderIndex: 3,
    },
    {
      songId: oceans.id,
      sectionType: "BRIDGE",
      sectionLabel: "Bridge",
      content: "Spirit lead me where my trust is without borders\nLet me walk upon the waters\nWherever You would call me\nTake me deeper than my feet could ever wander\nAnd my faith will be made stronger\nIn the presence of my Savior",
      orderIndex: 4,
    },
  ]);

  await db.insert(songTags).values([
    { songId: oceans.id, tagId: tagMap["Worship"] },
    { songId: oceans.id, tagId: tagMap["English"] },
    { songId: oceans.id, tagId: tagMap["Slow"] },
    { songId: oceans.id, tagId: tagMap["Contemporary"] },
  ]);

  // 6. Indah Rencana-Mu - JPCC Worship
  const [indahRencana] = await db.insert(songs).values({
    title: "Indah Rencana-Mu",
    slug: "indah-rencanamu-jpcc",
    artist: "JPCC Worship",
    album: "You Are My Everything",
    releaseYear: 2016,
    key: "C",
    tempo: 78,
    songFlow: ["Verse 1", "Pre-Chorus", "Chorus", "Verse 2", "Pre-Chorus", "Chorus", "Bridge", "Chorus"],
  }).returning();

  await db.insert(lyricSections).values([
    {
      songId: indahRencana.id,
      sectionType: "VERSE",
      sectionLabel: "Verse 1",
      content: "Kau pegang tanganku\nDi saat aku jatuh\nKau angkat aku\nBerdiri teguh lagi",
      orderIndex: 0,
    },
    {
      songId: indahRencana.id,
      sectionType: "PRE_CHORUS",
      sectionLabel: "Pre-Chorus",
      content: "Kau adalah Allah\nYang setia selalu\nMemberi kekuatan\nBagiku",
      orderIndex: 1,
    },
    {
      songId: indahRencana.id,
      sectionType: "CHORUS",
      sectionLabel: "Chorus",
      content: "Indah rencana-Mu bagiku\nLebih dari yang ku minta\nKau sempurnakan hidupku\nDalam kasih-Mu yang nyata",
      orderIndex: 2,
    },
    {
      songId: indahRencana.id,
      sectionType: "VERSE",
      sectionLabel: "Verse 2",
      content: "Ku tidak mengerti\nJalan yang Kau pilihkan\nNamun ku percaya\nSemua baik adanya",
      orderIndex: 3,
    },
    {
      songId: indahRencana.id,
      sectionType: "BRIDGE",
      sectionLabel: "Bridge",
      content: "Ku berserah kepada-Mu\nSegala yang ada padaku\nKarena Kau yang terbaik\nDalam hidupku",
      orderIndex: 4,
    },
  ]);

  await db.insert(songTags).values([
    { songId: indahRencana.id, tagId: tagMap["Worship"] },
    { songId: indahRencana.id, tagId: tagMap["Indonesian"] },
    { songId: indahRencana.id, tagId: tagMap["Contemporary"] },
    { songId: indahRencana.id, tagId: tagMap["Upbeat"] },
  ]);

  // 7. Mighty to Save - Hillsong
  const [mightyToSave] = await db.insert(songs).values({
    title: "Mighty to Save",
    slug: "mighty-to-save-hillsong",
    artist: "Hillsong Worship",
    album: "Saviour King",
    releaseYear: 2006,
    key: "E",
    tempo: 80,
    songFlow: ["Verse 1", "Chorus", "Verse 2", "Chorus", "Bridge", "Chorus"],
  }).returning();

  await db.insert(lyricSections).values([
    {
      songId: mightyToSave.id,
      sectionType: "VERSE",
      sectionLabel: "Verse 1",
      content: "Everyone needs compassion\nLove that's never failing\nLet mercy fall on me\nEveryone needs forgiveness\nThe kindness of a Savior\nThe hope of nations",
      orderIndex: 0,
    },
    {
      songId: mightyToSave.id,
      sectionType: "CHORUS",
      sectionLabel: "Chorus",
      content: "Savior, He can move the mountains\nMy God is mighty to save\nHe is mighty to save\nForever, Author of salvation\nHe rose and conquered the grave\nJesus conquered the grave",
      orderIndex: 1,
    },
    {
      songId: mightyToSave.id,
      sectionType: "VERSE",
      sectionLabel: "Verse 2",
      content: "So take me as You find me\nAll my fears and failures\nFill my life again\nI give my life to follow\nEverything I believe in\nNow I surrender",
      orderIndex: 2,
    },
    {
      songId: mightyToSave.id,
      sectionType: "BRIDGE",
      sectionLabel: "Bridge",
      content: "Shine Your light and let the whole world see\nWe're singing for the glory of the risen King\nJesus",
      orderIndex: 3,
    },
  ]);

  await db.insert(songTags).values([
    { songId: mightyToSave.id, tagId: tagMap["Praise"] },
    { songId: mightyToSave.id, tagId: tagMap["English"] },
    { songId: mightyToSave.id, tagId: tagMap["Upbeat"] },
    { songId: mightyToSave.id, tagId: tagMap["Contemporary"] },
  ]);

  // ─── Insert Playlists ──────────────────────────────────────────────────────
  console.log("  → Inserting playlists...");
  const today = "2026-08-17";

  const [p1] = await db.insert(playlists).values({
    name: "Ibadah AbbaYouth",
    description: "Setlist ibadah mingguan AbbaYouth",
    eventDate: today,
  }).returning();

  const [p2] = await db.insert(playlists).values({
    name: "Ibadah Worship Night AbbaYouth",
    description: "Setlist malam pujian dan penyembahan AbbaYouth",
    eventDate: today,
  }).returning();

  const [p3] = await db.insert(playlists).values({
    name: "Ibadah Natal AbbaYouth",
    description: "Setlist perayaan Natal AbbaYouth",
    eventDate: today,
  }).returning();

  // Link songs to playlists
  await db.insert(playlistSongs).values([
    // Ibadah AbbaYouth
    { playlistId: p1.id, songId: mengenalMu.id, orderIndex: 0 },
    { playlistId: p1.id, songId: indahRencana.id, orderIndex: 1 },
    { playlistId: p1.id, songId: mightyToSave.id, orderIndex: 2 },
    // Ibadah Worship Night
    { playlistId: p2.id, songId: oceans.id, orderIndex: 0 },
    { playlistId: p2.id, songId: mengenalMu.id, orderIndex: 1 },
    { playlistId: p2.id, songId: howGreat.id, orderIndex: 2 },
    // Ibadah Natal
    { playlistId: p3.id, songId: amazingGrace.id, orderIndex: 0 },
    { playlistId: p3.id, songId: satuYang.id, orderIndex: 1 },
    { playlistId: p3.id, songId: howGreat.id, orderIndex: 2 },
  ]);

  console.log("✅ Seeding complete!");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});

