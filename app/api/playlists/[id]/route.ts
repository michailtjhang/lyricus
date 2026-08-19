import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { playlists, playlistSongs } from "@/drizzle/schema";
import { eq, and, or } from "drizzle-orm";

function getPlaylistWhereCondition(idOrSlug: string) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  return isUuid
    ? or(eq(playlists.id, idOrSlug), eq(playlists.slug, idOrSlug))
    : eq(playlists.slug, idOrSlug);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const playlist = await db.query.playlists.findFirst({
      where: getPlaylistWhereCondition(id),
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
        song: ps.song
          ? {
              ...ps.song,
              tags: ps.song.songTags ? ps.song.songTags.map((st) => st.tag) : [],
              lyricSections: ps.song.lyricSections || [],
            }
          : null,
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
    const targetPlaylist = await db.query.playlists.findFirst({
      where: getPlaylistWhereCondition(id),
    });

    if (!targetPlaylist) {
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
    }

    const body = await req.json();
    const { songId, headerLabel } = body;

    if (!songId && !headerLabel) {
      return NextResponse.json({ error: "songId atau headerLabel wajib diisi" }, { status: 400 });
    }

    // Get current item count for order index
    const existing = await db
      .select()
      .from(playlistSongs)
      .where(eq(playlistSongs.playlistId, targetPlaylist.id));

    const nextOrder = existing.length;

    if (songId) {
      // Check if song already in playlist
      const alreadyIn = existing.find((ps) => ps.songId === songId);
      if (alreadyIn) {
        return NextResponse.json({ message: "Lagu sudah ada di playlist ini" }, { status: 200 });
      }
    }

    await db.insert(playlistSongs).values({
      playlistId: targetPlaylist.id,
      songId: songId || null,
      headerLabel: headerLabel || null,
      orderIndex: nextOrder,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error adding item to playlist:", error);
    return NextResponse.json({ error: "Gagal menambah item ke playlist" }, { status: 500 });
  }
}

// DELETE: Remove song/item from playlist
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const songId = searchParams.get("songId");
  const itemId = searchParams.get("itemId");

  if (!songId && !itemId) {
    return NextResponse.json({ error: "songId or itemId parameter required" }, { status: 400 });
  }

  try {
    const targetPlaylist = await db.query.playlists.findFirst({
      where: getPlaylistWhereCondition(id),
    });

    if (!targetPlaylist) {
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
    }

    if (itemId) {
      await db
        .delete(playlistSongs)
        .where(and(eq(playlistSongs.playlistId, targetPlaylist.id), eq(playlistSongs.id, itemId)));
    } else if (songId) {
      await db
        .delete(playlistSongs)
        .where(and(eq(playlistSongs.playlistId, targetPlaylist.id), eq(playlistSongs.songId, songId)));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing item from playlist:", error);
    return NextResponse.json({ error: "Gagal menghapus item dari playlist" }, { status: 500 });
  }
}

// PUT: Update playlist metadata and/or playlist items order (songs & headers)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const targetPlaylist = await db.query.playlists.findFirst({
      where: getPlaylistWhereCondition(id),
    });

    if (!targetPlaylist) {
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, description, eventDate, items, songIds } = body;

    // Update playlist metadata
    await db
      .update(playlists)
      .set({
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
        eventDate: eventDate !== undefined ? eventDate : undefined,
      })
      .where(eq(playlists.id, targetPlaylist.id));

    // Update playlist items order (supporting headers & songs)
    if (Array.isArray(items)) {
      await db.delete(playlistSongs).where(eq(playlistSongs.playlistId, targetPlaylist.id));
      if (items.length > 0) {
        await db.insert(playlistSongs).values(
          items.map((it: any, idx: number) => ({
            playlistId: targetPlaylist.id,
            songId: it.songId || null,
            headerLabel: it.headerLabel || null,
            orderIndex: idx,
          }))
        );
      }
    } else if (Array.isArray(songIds)) {
      await db.delete(playlistSongs).where(eq(playlistSongs.playlistId, targetPlaylist.id));
      if (songIds.length > 0) {
        await db.insert(playlistSongs).values(
          songIds.map((sId: string, idx: number) => ({
            playlistId: targetPlaylist.id,
            songId: sId,
            headerLabel: null,
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

