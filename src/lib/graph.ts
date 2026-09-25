import { getAllNotes } from './notes';
import { GraphData, GraphNode, GraphLink } from './types';

export function getGraphData(): GraphData {
  const notes = getAllNotes();
  const validSlugs = new Set(notes.map((n) => n.slug));

  const connectionCounts = new Map<string, number>();
  for (const n of notes) {
    connectionCounts.set(n.slug, (connectionCounts.get(n.slug) || 0) + n.outgoingLinks.length + n.backlinks.length);
  }

  const nodes: GraphNode[] = notes.map((n) => ({
    id: n.slug,
    title: n.title,
    type: n.metadata.type || 'concept',
    category: n.metadata.category,
    connections: connectionCounts.get(n.slug) || 1,
  }));

  const links: GraphLink[] = [];
  const existingPair = new Set<string>();

  for (const n of notes) {
    for (const target of n.outgoingLinks) {
      if (validSlugs.has(target)) {
        const pairKey = [n.slug, target].sort().join(':::');
        if (!existingPair.has(pairKey)) {
          existingPair.add(pairKey);
          links.push({
            source: n.slug,
            target: target,
          });
        }
      }
    }
  }

  return { nodes, links };
}
