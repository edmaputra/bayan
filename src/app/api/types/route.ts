import { NextResponse } from 'next/server';
import { getNoteTypes, addNoteType, updateNoteType, deleteNoteType } from '@/lib/note-types';
import { getAllNotes } from '@/lib/notes';

export async function GET() {
  try {
    const types = getNoteTypes();
    const notes = getAllNotes();

    // Calculate usage count for each type
    const countMap = new Map<string, number>();
    for (const note of notes) {
      const typeKey = (note.metadata.type || 'concept').toLowerCase();
      countMap.set(typeKey, (countMap.get(typeKey) || 0) + 1);
    }

    const enriched = types.map((t) => ({
      ...t,
      count: countMap.get(t.key.toLowerCase()) || 0,
    }));

    return NextResponse.json(enriched);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { key, label, icon, color, description } = body;

    if (!key || !label) {
      return NextResponse.json(
        { error: 'Kode tipe (key) dan nama label wajib diisi' },
        { status: 400 }
      );
    }

    const created = addNoteType({
      key,
      label,
      icon,
      color,
      description,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { key, label, icon, color, description } = body;

    if (!key) {
      return NextResponse.json({ error: 'Kode tipe (key) wajib disertakan' }, { status: 400 });
    }

    const updated = updateNoteType(key, {
      label,
      icon,
      color,
      description,
    });

    return NextResponse.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    const force = searchParams.get('force') === 'true';

    if (!key) {
      return NextResponse.json({ error: 'Kode tipe (key) wajib disertakan' }, { status: 400 });
    }

    // Safety check: is this type used by existing notes?
    if (!force) {
      const notes = getAllNotes();
      const usedBy = notes.filter((n) => (n.metadata.type || '').toLowerCase() === key.toLowerCase());
      if (usedBy.length > 0) {
        return NextResponse.json(
          {
            error: `Tipe "${key}" sedang digunakan oleh ${usedBy.length} catatan. Ubah tipe catatan tersebut terlebih dahulu atau gunakan penghapusan paksa.`,
            usedCount: usedBy.length,
          },
          { status: 409 }
        );
      }
    }

    deleteNoteType(key);
    return NextResponse.json({ success: true, message: `Tipe "${key}" berhasil dihapus` });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
