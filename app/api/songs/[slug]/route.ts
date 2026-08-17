import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { songs } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const song = await db.query.songs.findFirst({
      where: eq(songs.slug, slug),
      with: {
        lyricSections: {
          orderBy: (lyricSections, { asc }) => [asc(lyricSections.orderIndex)],
        },
        songTags: {
          with: {
            tag: true,
          },
        },
      },
    });

    if (!song) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    const formatted = {
      ...song,
      tags: song.songTags.map((st) => st.tag),
      lyricSections: song.lyricSections,
    };

    return NextResponse.json({ song: formatted });
  } catch (error) {
    console.error("Error fetching song:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const existingSong = await db.query.songs.findFirst({
      where: eq(songs.slug, slug),
    });

    if (!existingSong) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    const body = await req.json();
    const { title, artist, album, releaseYear, key, tempo, songFlow, sections, tagNames } = body;

    // Update song record
    await db
      .update(songs)
      .set({
        title: title || existingSong.title,
        artist: artist || existingSong.artist,
        album: album !== undefined ? album : existingSong.album,
        releaseYear: releaseYear !== undefined ? (releaseYear ? parseInt(releaseYear) : null) : existingSong.releaseYear,
        key: key !== undefined ? key : existingSong.key,
        tempo: tempo !== undefined ? (tempo ? parseInt(tempo) : null) : existingSong.tempo,
        songFlow: Array.isArray(songFlow) ? songFlow : existingSong.songFlow,
        updatedAt: new Date(),
      })
      .where(eq(songs.id, existingSong.id));

    const { lyricSections, songTags, tags } = await import("@/drizzle/schema");

    // Replace sections if provided
    if (Array.isArray(sections)) {
      await db.delete(lyricSections).where(eq(lyricSections.songId, existingSong.id));
      if (sections.length > 0) {
        await db.insert(lyricSections).values(
          sections.map((sec: any, idx: number) => ({
            songId: existingSong.id,
            sectionType: sec.sectionType || "VERSE",
            sectionLabel: sec.sectionLabel || "Verse 1",
            content: sec.content || "",
            orderIndex: idx,
          }))
        );
      }
    }

    // Replace tags if provided
    if (Array.isArray(tagNames)) {
      await db.delete(songTags).where(eq(songTags.songId, existingSong.id));
      const allDbTags = await db.select().from(tags);
      for (const name of tagNames) {
        const found = allDbTags.find((t) => t.name === name);
        if (found) {
          await db.insert(songTags).values({
            songId: existingSong.id,
            tagId: found.id,
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating song:", error);
    return NextResponse.json({ error: "Gagal memperbarui lagu" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    await db.delete(songs).where(eq(songs.slug, slug));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting song:", error);
    return NextResponse.json({ error: "Gagal menghapus lagu" }, { status: 500 });
  }
}

