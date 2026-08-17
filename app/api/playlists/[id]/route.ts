import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { playlists, playlistSongs } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const playlist = await db.query.playlists.findFirst({
      where: eq(playlists.id, id),
      with: {
        playlistSongs: {
          with: {
            song: {
              with: {
                lyricSections: {
                  orderBy: (sec, { asc }) => [asc(sec.orderIndex)],
                },
                songTags: {
                  with: {
                    tag: true,
                  },
                },
              },
            },
          },
          orderBy: (ps, { asc }) => [asc(ps.orderIndex)],
        },
      },
    });

    if (!playlist) {
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
    }

    const formatted = {
      ...playlist,
      playlistSongs: playlist.playlistSongs.map((ps) => ({
        ...ps,
        song: {
          ...ps.song,
          tags: ps.song.songTags.map((st) => st.tag),
          lyricSections: ps.song.lyricSections,
        },
      })),
    };

    return NextResponse.json({ playlist: formatted });
  } catch (error) {
    console.error("Error fetching playlist detail:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Add song to playlist
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { songId } = body;

    if (!songId) {
      return NextResponse.json({ error: "songId wajib diisi" }, { status: 400 });
    }

    // Get current item count for order index
    const existing = await db
      .select()
      .from(playlistSongs)
      .where(eq(playlistSongs.playlistId, id));

    const nextOrder = existing.length;

    // Check if song already in playlist
    const alreadyIn = existing.find((ps) => ps.songId === songId);
    if (alreadyIn) {
      return NextResponse.json({ message: "Lagu sudah ada di playlist ini" }, { status: 200 });
    }

    await db.insert(playlistSongs).values({
      playlistId: id,
      songId,
      orderIndex: nextOrder,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error adding song to playlist:", error);
    return NextResponse.json({ error: "Gagal menambah lagu ke playlist" }, { status: 500 });
  }
}

// DELETE: Remove song from playlist
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const songId = searchParams.get("songId");

  if (!songId) {
    return NextResponse.json({ error: "songId parameter required" }, { status: 400 });
  }

  try {
    await db
      .delete(playlistSongs)
      .where(and(eq(playlistSongs.playlistId, id), eq(playlistSongs.songId, songId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing song from playlist:", error);
    return NextResponse.json({ error: "Gagal menghapus lagu dari playlist" }, { status: 500 });
  }
}

// PUT: Update playlist metadata and/or song list order
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { name, description, eventDate, songIds } = body;

    // Update playlist metadata
    await db
      .update(playlists)
      .set({
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
        eventDate: eventDate !== undefined ? eventDate : undefined,
      })
      .where(eq(playlists.id, id));

    // Update song list order if songIds array provided
    if (Array.isArray(songIds)) {
      await db.delete(playlistSongs).where(eq(playlistSongs.playlistId, id));
      if (songIds.length > 0) {
        await db.insert(playlistSongs).values(
          songIds.map((sId: string, idx: number) => ({
            playlistId: id,
            songId: sId,
            orderIndex: idx,
          }))
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating playlist:", error);
    return NextResponse.json({ error: "Gagal memperbarui playlist" }, { status: 500 });
  }
}

