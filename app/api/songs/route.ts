import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { asc, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const tag = searchParams.get("tag") || "";
  const sort = searchParams.get("sort") || "recent";

  try {
    // Build base query with relations
    let songResults = await db.query.songs.findMany({
      with: {
        songTags: {
          with: {
            tag: true,
          },
        },
      },
      orderBy: (songs, { desc, asc }) => {
        if (sort === "alpha") return [asc(songs.title)];
        return [desc(songs.createdAt)];
      },
    });

    // Filter by search query
    if (q) {
      const lowerQ = q.toLowerCase();
      songResults = songResults.filter(
        (s) =>
          s.title.toLowerCase().includes(lowerQ) ||
          s.artist.toLowerCase().includes(lowerQ)
      );
    }

    // Filter by tag
    if (tag) {
      songResults = songResults.filter((s) =>
        s.songTags.some((st) => st.tag.name === tag)
      );
    }

    // Format response
    const formatted = songResults.map((s) => ({
      id: s.id,
      title: s.title,
      slug: s.slug,
      artist: s.artist,
      album: s.album,
      releaseYear: s.releaseYear,
      key: s.key,
      tempo: s.tempo,
      songFlow: s.songFlow,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      tags: s.songTags.map((st) => st.tag),
    }));

    return NextResponse.json({ songs: formatted, total: formatted.length });
  } catch (error) {
    console.error("Error fetching songs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, artist, album, releaseYear, key, tempo, songFlow, sections, tagNames } = body;

    if (!title || !artist) {
      return NextResponse.json({ error: "Judul dan Artis wajib diisi" }, { status: 400 });
    }

    // Generate slug from title + artist
    const slugBase = `${title}-${artist}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const slug = `${slugBase}-${Date.now().toString().slice(-4)}`;

    // Import schema
    const { songs, lyricSections, tags, songTags } = await import("@/drizzle/schema");

    // Insert song
    const [newSong] = await db
      .insert(songs)
      .values({
        title,
        slug,
        artist,
        album: album || null,
        releaseYear: releaseYear ? parseInt(releaseYear) : null,
        key: key || null,
        tempo: tempo ? parseInt(tempo) : null,
        songFlow: Array.isArray(songFlow) ? songFlow : [],
      })
      .returning();

    // Insert lyric sections
    if (Array.isArray(sections) && sections.length > 0) {
      await db.insert(lyricSections).values(
        sections.map((sec: any, idx: number) => ({
          songId: newSong.id,
          sectionType: sec.sectionType || "VERSE",
          sectionLabel: sec.sectionLabel || "Verse 1",
          content: sec.content || "",
          orderIndex: idx,
        }))
      );
    }

    // Insert tags
    if (Array.isArray(tagNames) && tagNames.length > 0) {
      const allDbTags = await db.select().from(tags);
      for (const name of tagNames) {
        const found = allDbTags.find((t) => t.name === name);
        if (found) {
          await db.insert(songTags).values({
            songId: newSong.id,
            tagId: found.id,
          });
        }
      }
    }

    return NextResponse.json({ song: newSong, success: true }, { status: 201 });
  } catch (error) {
    console.error("Error creating song:", error);
    return NextResponse.json({ error: "Gagal membuat lagu baru" }, { status: 500 });
  }
}

