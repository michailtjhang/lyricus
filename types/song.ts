// ─── Type Definitions untuk Lyricus ─────────────────────────────────────────

export type SectionType =
  | "INTRO"
  | "VERSE"
  | "PRE_CHORUS"
  | "CHORUS"
  | "BRIDGE"
  | "INTERLUDE"
  | "OUTRO"
  | "TAG"
  | "ENDING";

export type TagCategory = "GENRE" | "LANGUAGE" | "THEME";

export interface Tag {
  id: string;
  name: string;
  category: TagCategory;
}

export interface LyricSection {
  id: string;
  songId: string;
  sectionType: SectionType;
  sectionLabel: string;
  content: string;
  orderIndex: number;
}

export interface Song {
  id: string;
  title: string;
  slug: string;
  artist: string;
  album: string | null;
  releaseYear: number | null;
  key: string | null;
  tempo: number | null;
  songFlow: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SongWithDetails extends Song {
  lyricSections: LyricSection[];
  tags: Tag[];
}

export interface SongCard extends Song {
  tags: Tag[];
}

export interface Playlist {
  id: string;
  name: string;
  description: string | null;
  eventDate: string | null;
  createdAt: Date;
}

export interface PlaylistSongItem {
  id: string;
  playlistId: string;
  songId: string;
  orderIndex: number;
  song: SongWithDetails;
}


export interface PlaylistWithSongs extends Playlist {
  playlistSongs: PlaylistSongItem[];
}

