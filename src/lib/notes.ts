import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Note, NoteMetadata, NoteType } from './types';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export function normalizeSlug(name: string): string {
  return name
    .trim()
    .replace(/[\\/:\*\?"<>\|]/g, '')
    .replace(/\s+/g, '-');
}

export function extractWikilinks(content: string): string[] {
  const matches = content.matchAll(/\[\[(.*?)\]\]/g);
  const links: string[] = [];
  for (const match of matches) {
    const raw = match[1];
    // if syntax is [[Target|Label]], take Target
    const target = raw.split('|')[0].trim();
    if (target) {
      links.push(target);
    }
  }
  return Array.from(new Set(links));
}

export function getNoteFiles(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
    return [];
  }
  return fs.readdirSync(CONTENT_DIR).filter((file) => file.endsWith('.md'));
}

export function getAllNotes(): Note[] {
  const files = getNoteFiles();
  const rawNotes: Array<{
    slug: string;
    title: string;
    content: string;
    metadata: NoteMetadata;
    outgoingRaw: string[];
  }> = [];

  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const fullPath = path.join(CONTENT_DIR, file);
    const fileContent = fs.readFileSync(fullPath, 'utf8');
    const parsed = matter(fileContent);
    const metadata = (parsed.data || {}) as NoteMetadata;
    const title = metadata.title || slug.replace(/-/g, ' ');
    const outgoingRaw = extractWikilinks(parsed.content);

    rawNotes.push({
      slug,
      title,
      content: parsed.content,
      metadata,
      outgoingRaw,
    });
  }

  // Build mapping from title / slug to canonical slug
  const titleToSlug = new Map<string, string>();
  for (const note of rawNotes) {
    titleToSlug.set(note.slug.toLowerCase(), note.slug);
    titleToSlug.set(normalizeSlug(note.slug).toLowerCase(), note.slug);
    titleToSlug.set(note.title.toLowerCase(), note.slug);
    titleToSlug.set(normalizeSlug(note.title).toLowerCase(), note.slug);
  }

  // Resolve links & calculate backlinks
  const backlinksMap = new Map<string, Array<{ slug: string; title: string; type?: NoteType }>>();
  for (const note of rawNotes) {
    backlinksMap.set(note.slug, []);
  }

  const finalNotes: Note[] = rawNotes.map((note) => {
    const outgoingSlugs: string[] = [];
    for (const rawTarget of note.outgoingRaw) {
      const resolved = titleToSlug.get(rawTarget.toLowerCase()) || normalizeSlug(rawTarget);
      outgoingSlugs.push(resolved);
    }

    return {
      slug: note.slug,
      title: note.title,
      content: note.content,
      metadata: note.metadata,
      outgoingLinks: Array.from(new Set(outgoingSlugs)),
      backlinks: [],
    };
  });

  // Populate backlinks
  for (const note of finalNotes) {
    for (const targetSlug of note.outgoingLinks) {
      const list = backlinksMap.get(targetSlug);
      if (list) {
        list.push({
          slug: note.slug,
          title: note.title,
          type: note.metadata.type,
        });
      }
    }
  }

  for (const note of finalNotes) {
    note.backlinks = backlinksMap.get(note.slug) || [];
  }

  return finalNotes;
}

export function getNoteBySlug(slug: string): Note | null {
  const all = getAllNotes();
  const target = slug.toLowerCase();
  return all.find((n) => n.slug.toLowerCase() === target || normalizeSlug(n.title).toLowerCase() === target) || null;
}

export function saveNote(slug: string, metadata: NoteMetadata, content: string): Note {
  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
  }

  const safeSlug = normalizeSlug(slug || metadata.title || 'untitled');
  const filePath = path.join(CONTENT_DIR, `${safeSlug}.md`);

  const fileData = matter.stringify(content, metadata);
  fs.writeFileSync(filePath, fileData, 'utf8');

  return getNoteBySlug(safeSlug)!;
}
