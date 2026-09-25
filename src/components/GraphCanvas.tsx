'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { GraphData, GraphNode, NoteType } from '@/lib/types';
import { Maximize2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

interface Props {
  height?: number;
  highlightSlug?: string;
  onNodeClick?: (slug: string) => void;
  fullScreen?: boolean;
}

const TYPE_COLORS: Record<NoteType, { fill: string; stroke: string; glow: string }> = {
  concept: { fill: '#0284c7', stroke: '#38bdf8', glow: 'rgba(2, 132, 199, 0.4)' },
  hukum: { fill: '#d97706', stroke: '#fbbf24', glow: 'rgba(217, 119, 6, 0.4)' },
  dalil: { fill: '#059669', stroke: '#34d399', glow: 'rgba(5, 150, 105, 0.4)' },
  kitab: { fill: '#7c3aed', stroke: '#a78bfa', glow: 'rgba(124, 58, 237, 0.4)' },
  tokoh: { fill: '#e11d48', stroke: '#fb7185', glow: 'rgba(225, 29, 72, 0.4)' },
};

interface SimNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface SimLink {
  source: SimNode;
  target: SimNode;
}

export default function GraphCanvas({ height = 450, highlightSlug, onNodeClick, fullScreen = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const router = useRouter();

  const [data, setData] = useState<GraphData | null>(null);
  const [hoveredNode, setHoveredNode] = useState<SimNode | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [showLabels, setShowLabels] = useState(true);

  const simNodesRef = useRef<SimNode[]>([]);
  const simLinksRef = useRef<SimLink[]>([]);
  const draggingNodeRef = useRef<SimNode | null>(null);
  const isPanningRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const animFrameIdRef = useRef<number | null>(null);

  // Load Graph Data
  useEffect(() => {
    fetch('/api/graph')
      .then((res) => res.json())
      .then((graphData: GraphData) => {
        setData(graphData);
      })
      .catch((err) => console.error('Failed to load graph data', err));
  }, []);

  // Initialize Force Simulation positions
  useEffect(() => {
    if (!data || !canvasRef.current) return;

    const width = canvasRef.current.clientWidth || 600;
    const h = fullScreen ? window.innerHeight - 80 : height;

    const nodesMap = new Map<string, SimNode>();
    const angleStep = (2 * Math.PI) / (data.nodes.length || 1);

    const simNodes: SimNode[] = data.nodes.map((node, i) => {
      const radius = Math.min(18, Math.max(6, 6 + (node.connections || 1) * 2));
      const dist = Math.min(width, h) * 0.35 * Math.sqrt(Math.random() * 0.8 + 0.2);
      const angle = i * angleStep;

      const simNode: SimNode = {
        ...node,
        x: width / 2 + Math.cos(angle) * dist + (Math.random() - 0.5) * 40,
        y: h / 2 + Math.sin(angle) * dist + (Math.random() - 0.5) * 40,
        vx: 0,
        vy: 0,
        radius,
      };
      nodesMap.set(node.id, simNode);
      return simNode;
    });

    const simLinks: SimLink[] = [];
    for (const link of data.links) {
      const src = nodesMap.get(link.source);
      const tgt = nodesMap.get(link.target);
      if (src && tgt) {
        simLinks.push({ source: src, target: tgt });
      }
    }

    simNodesRef.current = simNodes;
    simLinksRef.current = simLinks;
  }, [data, height, fullScreen]);

  // Physics Simulation Step
  const stepSimulation = useCallback(() => {
    const nodes = simNodesRef.current;
    const links = simLinksRef.current;
    if (!nodes.length) return;

    const repulsion = 1200;
    const linkDistance = 90;
    const linkStrength = 0.05;
    const centerStrength = 0.01;
    const damping = 0.88;

    const canvas = canvasRef.current;
    const cx = canvas ? canvas.clientWidth / 2 : 300;
    const cy = canvas ? (fullScreen ? window.innerHeight / 2 : height / 2) : 225;

    // Center attraction
    for (const node of nodes) {
      if (node === draggingNodeRef.current) continue;
      node.vx += (cx - node.x) * centerStrength;
      node.vy += (cy - node.y) * centerStrength;
    }

    // Repulsion between nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distSq = dx * dx + dy * dy || 1;
        const dist = Math.sqrt(distSq);

        if (dist < 350) {
          const force = (repulsion / distSq) * 0.8;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (a !== draggingNodeRef.current) {
            a.vx -= fx;
            a.vy -= fy;
          }
          if (b !== draggingNodeRef.current) {
            b.vx += fx;
            b.vy += fy;
          }
        }
      }
    }

    // Link spring attraction
    for (const link of links) {
      const dx = link.target.x - link.source.x;
      const dy = link.target.y - link.source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (dist - linkDistance) * linkStrength;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      if (link.source !== draggingNodeRef.current) {
        link.source.vx += fx;
        link.source.vy += fy;
      }
      if (link.target !== draggingNodeRef.current) {
        link.target.vx -= fx;
        link.target.vy -= fy;
      }
    }

    // Apply velocities
    for (const node of nodes) {
      if (node === draggingNodeRef.current) continue;
      node.vx *= damping;
      node.vy *= damping;
      node.x += node.vx;
      node.y += node.vy;
    }
  }, [fullScreen, height]);

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;
      stepSimulation();

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = fullScreen ? window.innerHeight - 80 : height;

      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // Apply Pan & Zoom
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.k, transform.k);

      const nodes = simNodesRef.current;
      const links = simLinksRef.current;

      const activeSlug = hoveredNode ? hoveredNode.id : highlightSlug;
      const connectedNodeIds = new Set<string>();

      if (activeSlug) {
        connectedNodeIds.add(activeSlug);
        for (const link of links) {
          if (link.source.id === activeSlug) connectedNodeIds.add(link.target.id);
          if (link.target.id === activeSlug) connectedNodeIds.add(link.source.id);
        }
      }

      // 1. Draw Links
      for (const link of links) {
        const isConnected =
          !activeSlug ||
          (connectedNodeIds.has(link.source.id) && connectedNodeIds.has(link.target.id));

        ctx.beginPath();
        ctx.moveTo(link.source.x, link.source.y);
        ctx.lineTo(link.target.x, link.target.y);
        ctx.strokeStyle = isConnected
          ? activeSlug
            ? '#38bdf8'
            : 'rgba(148, 163, 184, 0.4)'
          : 'rgba(148, 163, 184, 0.08)';
        ctx.lineWidth = isConnected && activeSlug ? 2.5 : 1.2;
        ctx.stroke();
      }

      // 2. Draw Nodes
      for (const node of nodes) {
        const isHighlighted = activeSlug ? connectedNodeIds.has(node.id) : true;
        const isHovered = hoveredNode?.id === node.id || highlightSlug === node.id;
        const color = TYPE_COLORS[node.type] || TYPE_COLORS.concept;

        ctx.save();
        ctx.globalAlpha = isHighlighted ? 1.0 : 0.2;

        // Glow effect on hovered/connected
        if (isHovered) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 6, 0, 2 * Math.PI);
          ctx.fillStyle = color.glow;
          ctx.fill();
        }

        // Main node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
        ctx.fillStyle = color.fill;
        ctx.fill();
        ctx.strokeStyle = isHovered ? '#ffffff' : color.stroke;
        ctx.lineWidth = isHovered ? 2.5 : 1.5;
        ctx.stroke();

        // Node Title Label
        if (showLabels || isHovered) {
          ctx.font = isHovered
            ? '600 13px system-ui, -apple-system, sans-serif'
            : '500 11px system-ui, -apple-system, sans-serif';
          ctx.fillStyle = isHovered ? '#0f172a' : '#334155';

          // Dark mode adjustment if dark background
          const isDark = document.documentElement.classList.contains('dark');
          if (isDark) {
            ctx.fillStyle = isHovered ? '#ffffff' : '#cbd5e1';
          }

          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(node.title, node.x, node.y + node.radius + 4);
        }

        ctx.restore();
      }

      ctx.restore();
      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [transform, hoveredNode, highlightSlug, showLabels, height, fullScreen, stepSimulation]);

  // Screen to World coords
  const screenToWorld = (sx: number, sy: number) => {
    return {
      x: (sx - transform.x) / transform.k,
      y: (sy - transform.y) / transform.k,
    };
  };

  // Find node under mouse
  const findNodeAt = (sx: number, sy: number): SimNode | null => {
    const { x, y } = screenToWorld(sx, sy);
    const nodes = simNodesRef.current;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      const dx = node.x - x;
      const dy = node.y - y;
      if (dx * dx + dy * dy <= (node.radius + 4) * (node.radius + 4)) {
        return node;
      }
    }
    return null;
  };

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    const hit = findNodeAt(sx, sy);
    if (hit) {
      draggingNodeRef.current = hit;
    } else {
      isPanningRef.current = true;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    if (draggingNodeRef.current) {
      const { x, y } = screenToWorld(sx, sy);
      draggingNodeRef.current.x = x;
      draggingNodeRef.current.y = y;
      draggingNodeRef.current.vx = 0;
      draggingNodeRef.current.vy = 0;
      return;
    }

    if (isPanningRef.current) {
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      setTransform((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    const hit = findNodeAt(sx, sy);
    setHoveredNode(hit);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggingNodeRef.current) {
      draggingNodeRef.current = null;
    }
    isPanningRef.current = false;
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const hit = findNodeAt(sx, sy);

    if (hit) {
      if (onNodeClick) {
        onNodeClick(hit.id);
      } else {
        router.push(`/notes/${hit.id}`);
      }
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setTransform((prev) => {
      const newK = Math.max(0.3, Math.min(3.5, prev.k * zoomFactor));
      return { ...prev, k: newK };
    });
  };

  const resetView = () => {
    setTransform({ x: 0, y: 0, k: 1 });
  };

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 shadow-sm ${fullScreen ? 'h-full' : ''}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
        style={{ height: fullScreen ? '100%' : `${height}px` }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
      />

      {/* Floating Controls */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <button
          onClick={() => setTransform((t) => ({ ...t, k: Math.min(3.5, t.k * 1.2) }))}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTransform((t) => ({ ...t, k: Math.max(0.3, t.k * 0.8) }))}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetView}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowLabels(!showLabels)}
          className={`px-2 py-1 text-xs font-medium rounded-lg transition ${
            showLabels
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Labels
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-3 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs shadow-sm">
        <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block"></span> Konsep
        </span>
        <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block"></span> Hukum
        </span>
        <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span> Dalil
        </span>
        <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block"></span> Kitab
        </span>
      </div>
    </div>
  );
}
