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

export interface NoteFileEntry {
  relativePath: string;
  fullPath: string;
  subfolder: string;
  slug: string;
}

export function getAllNoteFiles(dir = CONTENT_DIR, base = ''): NoteFileEntry[] {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    return [];
  }
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let results: NoteFileEntry[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const resPath = path.join(dir, entry.name);
    const relPath = base ? path.join(base, entry.name) : entry.name;

    if (entry.isDirectory()) {
      results = results.concat(getAllNoteFiles(resPath, relPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const subfolder = path.dirname(relPath) === '.' ? '' : path.dirname(relPath);
      const slug = entry.name.replace(/\.md$/, '');
      results.push({
        relativePath: relPath,
        fullPath: resPath,
        subfolder,
        slug,
      });
    }
  }
  return results;
}

export function getNoteFiles(): string[] {
  return getAllNoteFiles().map((f) => f.relativePath);
}

export function getAllNotes(): Note[] {
  const fileEntries = getAllNoteFiles();
  const rawNotes: Array<{
    slug: string;
    filePath: string;
    subfolder: string;
    title: string;
    content: string;
    metadata: NoteMetadata;
    outgoingRaw: string[];
  }> = [];

  for (const file of fileEntries) {
    const fileContent = fs.readFileSync(file.fullPath, 'utf8');
    const parsed = matter(fileContent);
    const metadata = (parsed.data || {}) as NoteMetadata;

    // Fallback category if not specified in frontmatter but file is in a subfolder
    if (!metadata.category && file.subfolder) {
      metadata.category = file.subfolder.replace(/[\\/]/g, ' / ');
    }

    const title = metadata.title || file.slug.replace(/-/g, ' ');
    const outgoingRaw = extractWikilinks(parsed.content);

    rawNotes.push({
      slug: file.slug,
      filePath: file.relativePath,
      subfolder: file.subfolder,
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
    if (note.filePath) {
      titleToSlug.set(note.filePath.replace(/\.md$/, '').toLowerCase(), note.slug);
    }
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
      filePath: note.filePath,
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
  return (
    all.find(
      (n) =>
        n.slug.toLowerCase() === target ||
        normalizeSlug(n.title).toLowerCase() === target ||
        (n.filePath && n.filePath.replace(/\.md$/, '').toLowerCase() === target)
    ) || null
  );
}

export function saveNote(slug: string, metadata: NoteMetadata, content: string): Note {
  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
  }

  const safeSlug = normalizeSlug(slug || metadata.title || 'untitled');
  const fileEntries = getAllNoteFiles();
  const existing = fileEntries.find(
    (f) => f.slug.toLowerCase() === safeSlug.toLowerCase() || f.slug.toLowerCase() === slug.toLowerCase()
  );

  let targetFilePath: string;

  if (existing) {
    targetFilePath = existing.fullPath;
  } else {
    // New note: if category provided, create/use the category folder
    if (metadata.category && metadata.category.trim()) {
      const catFolder = metadata.category
        .split('/')
        .map((p) => p.trim().replace(/[\\/:\*\?"<>\|]/g, ''))
        .filter(Boolean)
        .join(path.sep);

      const dirPath = catFolder ? path.join(CONTENT_DIR, catFolder) : CONTENT_DIR;
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      targetFilePath = path.join(dirPath, `${safeSlug}.md`);
    } else {
      targetFilePath = path.join(CONTENT_DIR, `${safeSlug}.md`);
    }
  }

  const fileData = matter.stringify(content, metadata);
  fs.writeFileSync(targetFilePath, fileData, 'utf8');

  return getNoteBySlug(safeSlug)!;
}
