import { pgTable, uuid, varchar, integer, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── songs ────────────────────────────────────────────────────────────────────
export const songs = pgTable("songs", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  artist: varchar("artist", { length: 255 }).notNull(),
  album: varchar("album", { length: 255 }),
  releaseYear: integer("release_year"),
  key: varchar("key", { length: 10 }),
  tempo: integer("tempo"),
  youtubeUrl: varchar("youtube_url", { length: 500 }),
  songFlow: text("song_flow").array().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── lyric_sections ──────────────────────────────────────────────────────────
export const lyricSections = pgTable("lyric_sections", {
  id: uuid("id").defaultRandom().primaryKey(),
  songId: uuid("song_id")
    .notNull()
    .references(() => songs.id, { onDelete: "cascade" }),
  sectionType: varchar("section_type", { length: 50 }).notNull(), // VERSE, CHORUS, PRE_CHORUS, BRIDGE, OUTRO, INTRO, INTERLUDE, TAG, ENDING
  sectionLabel: varchar("section_label", { length: 50 }).notNull(), // "Verse 1", "Chorus", etc
  content: text("content").notNull(),
  orderIndex: integer("order_index").notNull(),
});

// ─── tags ─────────────────────────────────────────────────────────────────────
export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 50 }).unique().notNull(),
  category: varchar("category", { length: 50 }).notNull(), // GENRE, LANGUAGE, THEME
});

// ─── song_tags (junction) ────────────────────────────────────────────────────
export const songTags = pgTable("song_tags", {
  songId: uuid("song_id")
    .notNull()
    .references(() => songs.id, { onDelete: "cascade" }),
  tagId: uuid("tag_id")
    .notNull()
    .references(() => tags.id, { onDelete: "cascade" }),
});

// ─── playlists ────────────────────────────────────────────────────────────────
export const playlists = pgTable("playlists", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  description: text("description"),
  eventDate: varchar("event_date", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── playlist_songs (junction) ───────────────────────────────────────────────
export const playlistSongs = pgTable("playlist_songs", {
  id: uuid("id").defaultRandom().primaryKey(),
  playlistId: uuid("playlist_id")
    .notNull()
    .references(() => playlists.id, { onDelete: "cascade" }),
  songId: uuid("song_id")
    .references(() => songs.id, { onDelete: "cascade" }), // null if standalone section header
  headerLabel: varchar("header_label", { length: 255 }), // e.g. "Perjamuan Kudus", "Altar Call"
  isMedley: boolean("is_medley").default(false),
  orderIndex: integer("order_index").notNull(),
});

// ─── Relations ────────────────────────────────────────────────────────────────
export const songsRelations = relations(songs, ({ many }) => ({
  lyricSections: many(lyricSections),
  songTags: many(songTags),
  playlistSongs: many(playlistSongs),
}));

export const lyricSectionsRelations = relations(lyricSections, ({ one }) => ({
  song: one(songs, { fields: [lyricSections.songId], references: [songs.id] }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  songTags: many(songTags),
}));

export const songTagsRelations = relations(songTags, ({ one }) => ({
  song: one(songs, { fields: [songTags.songId], references: [songs.id] }),
  tag: one(tags, { fields: [songTags.tagId], references: [tags.id] }),
}));

export const playlistsRelations = relations(playlists, ({ many }) => ({
  playlistSongs: many(playlistSongs),
}));

export const playlistSongsRelations = relations(playlistSongs, ({ one }) => ({
  playlist: one(playlists, { fields: [playlistSongs.playlistId], references: [playlists.id] }),
  song: one(songs, { fields: [playlistSongs.songId], references: [songs.id] }),
}));

