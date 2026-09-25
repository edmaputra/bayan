export type NoteType = 'concept' | 'hukum' | 'dalil' | 'kitab' | 'tokoh';

export interface NoteMetadata {
  title: string;
  type?: NoteType;
  category?: string;
  parent?: string;
  tags?: string[];
  arabic?: string;
  summary?: string;
  // Specific to Dalil
  source_type?: 'Al-Qur\'an' | 'Hadits' | 'Ijma\'' | 'Qiyas' | 'Atsar';
  surah?: number;
  ayah?: number;
  narrator?: string;
  reference?: string;
  grade?: string;
  translation?: string;
  // Specific to Kitab / Hukum
  author?: string;
  field?: string;
  madzhab?: string;
  status_hukum?: string;
}

export interface Note {
  slug: string;
  title: string;
  content: string;
  metadata: NoteMetadata;
  outgoingLinks: string[]; // List of slugs referenced by this note
  backlinks: Array<{ slug: string; title: string; type?: NoteType }>; // List of notes referencing this note
}

export interface GraphNode {
  id: string;
  title: string;
  type: NoteType;
  category?: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  connections: number;
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
