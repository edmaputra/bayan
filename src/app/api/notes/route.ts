import { NextResponse } from 'next/server';
import { getAllNotes, saveNote } from '@/lib/notes';

export async function GET() {
  try {
    const notes = getAllNotes();
    const summary = notes.map((n) => ({
      slug: n.slug,
      title: n.title,
      type: n.metadata.type,
      category: n.metadata.category,
      tags: n.metadata.tags || [],
      summary: n.metadata.summary,
      arabic: n.metadata.arabic,
      outgoingCount: n.outgoingLinks.length,
      backlinksCount: n.backlinks.length,
    }));
    return NextResponse.json(summary);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, metadata, content } = body;

    if (!metadata?.title && !slug) {
      return NextResponse.json({ error: 'Title or slug is required' }, { status: 400 });
    }

    const saved = saveNote(slug, metadata, content || '');
    return NextResponse.json(saved);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
