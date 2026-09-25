'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ExternalLink } from 'lucide-react';
import { NoteType } from '@/lib/types';

interface Props {
  content: string;
}

interface NoteSummary {
  slug: string;
  title: string;
  type?: NoteType;
  arabic?: string;
  summary?: string;
}

export default function MarkdownViewer({ content }: Props) {
  const [allNotes, setAllNotes] = useState<Record<string, NoteSummary>>({});
  const [hoveredLink, setHoveredLink] = useState<{
    slug: string;
    targetTitle: string;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    fetch('/api/notes')
      .then((res) => res.json())
      .then((data: NoteSummary[]) => {
        const map: Record<string, NoteSummary> = {};
        for (const item of data) {
          map[item.slug.toLowerCase()] = item;
          map[item.title.toLowerCase()] = item;
        }
        setAllNotes(map);
      })
      .catch((err) => console.error(err));
  }, []);

  // Pre-process [[Link]] into a markdown-compatible placeholder or render via custom components
  // Replace [[Target|Label]] or [[Target]] with custom HTML tag or custom markdown token
  const processWikilinks = (text: string) => {
    return text.replace(/\[\[(.*?)\]\]/g, (_, match) => {
      const parts = match.split('|');
      const target = parts[0].trim();
      const label = parts[1]?.trim() || target;
      const slug = target.replace(/[\\/:\*\?"<>\|]/g, '').replace(/\s+/g, '-');
      return `[wikilink:${target}:${label}](/notes/${slug})`;
    });
  };

  const processedContent = processWikilinks(content);

  const handleMouseEnter = (target: string, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const slug = target.replace(/[\\/:\*\?"<>\|]/g, '').replace(/\s+/g, '-');
    setHoveredLink({
      slug,
      targetTitle: target,
      x: rect.left,
      y: rect.bottom + window.scrollY + 6,
    });
  };

  const handleMouseLeave = () => {
    setHoveredLink(null);
  };

  const activeHoverNote = hoveredLink
    ? allNotes[hoveredLink.slug.toLowerCase()] || allNotes[hoveredLink.targetTitle.toLowerCase()]
    : null;

  return (
    <div className="relative prose prose-slate dark:prose-invert max-w-none prose-headings:font-semibold prose-a:no-underline">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            if (typeof children === 'string' && children.startsWith('wikilink:')) {
              const parts = children.split(':');
              const target = parts[1];
              const label = parts.slice(2).join(':') || target;
              const slug = target.replace(/[\\/:\*\?"<>\|]/g, '').replace(/\s+/g, '-');

              return (
                <Link
                  href={`/notes/${slug}`}
                  onMouseEnter={(e) => handleMouseEnter(target, e)}
                  onMouseLeave={handleMouseLeave}
                  className="inline-flex items-center gap-1 px-2 py-0.5 mx-0.5 rounded-md font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 dark:text-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-800/80 dark:hover:bg-emerald-900/60 transition shadow-xs"
                >
                  <span>{label}</span>
                </Link>
              );
            }

            return (
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline inline-flex items-center gap-1">
                {children} <ExternalLink className="w-3 h-3 inline" />
              </a>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 px-4 py-3 rounded-r-xl my-4 text-slate-800 dark:text-slate-200 font-normal">
              {children}
            </blockquote>
          ),
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold border-b border-slate-200 dark:border-slate-800 pb-3 mb-6 text-slate-900 dark:text-slate-50">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold mt-8 mb-4 text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-emerald-600 rounded-full inline-block"></span>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold mt-6 mb-3 text-slate-800 dark:text-slate-200">
              {children}
            </h3>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>

      {/* Hover Card / Popover Preview */}
      {hoveredLink && activeHoverNote && (
        <div
          className="fixed z-50 w-72 p-3.5 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 text-xs pointer-events-none transition-opacity animate-in fade-in zoom-in-95 duration-100"
          style={{
            top: `${Math.min(window.innerHeight - 180, hoveredLink.y)}px`,
            left: `${Math.min(window.innerWidth - 300, Math.max(16, hoveredLink.x - 20))}px`,
          }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {activeHoverNote.type || 'Catatan'}
            </span>
            <span className="font-bold text-slate-900 dark:text-slate-100 truncate">
              {activeHoverNote.title}
            </span>
          </div>
          {activeHoverNote.arabic && (
            <div className="font-serif text-sm text-emerald-800 dark:text-emerald-300 my-1 text-right" dir="rtl">
              {activeHoverNote.arabic}
            </div>
          )}
          {activeHoverNote.summary && (
            <p className="text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mt-1">
              {activeHoverNote.summary}
            </p>
          )}
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            Klik untuk membuka halaman penuh →
          </div>
        </div>
      )}
    </div>
  );
}
