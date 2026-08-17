import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { playlists, playlistSongs } from "@/drizzle/schema";

export async function GET() {
  try {
    const list = await db.query.playlists.findMany({
      with: {
        playlistSongs: {
          with: {
            song: {
              with: {
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
      orderBy: (p, { desc }) => [desc(p.createdAt)],
    });

    function getPlaylistPriority(name: string): number {
      const lower = name.toLowerCase();
      if (lower.includes("natal")) return 3;
      if (lower.includes("worship")) return 2;
      if (lower.includes("ibadah")) return 1;
      return 4;
    }

    const formatted = list
      .map((p) => ({
        ...p,
        playlistSongs: p.playlistSongs.map((ps) => ({
          ...ps,
          song: {
            ...ps.song,
            tags: ps.song.songTags.map((st) => st.tag),
          },
        })),
      }))
      .sort((a, b) => {
        const priorityDiff = getPlaylistPriority(a.name) - getPlaylistPriority(b.name);
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

    return NextResponse.json({ playlists: formatted });
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, eventDate } = body;

    if (!name) {
      return NextResponse.json({ error: "Nama playlist wajib diisi" }, { status: 400 });
    }

    const [newPlaylist] = await db
      .insert(playlists)
      .values({
        name,
        description: description || null,
        eventDate: eventDate || new Date().toISOString().split("T")[0],
      })
      .returning();

    return NextResponse.json({ playlist: newPlaylist, success: true }, { status: 201 });
  } catch (error) {
    console.error("Error creating playlist:", error);
    return NextResponse.json({ error: "Gagal membuat playlist" }, { status: 500 });
  }
}
