import React from 'react';
import {
  FileText,
  Scale,
  BookOpen,
  Bookmark,
  Users,
  Lightbulb,
  Quote,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  Folder,
  Tag,
  Scroll,
  Compass,
  MessageSquare,
  BookMarked,
  Feather,
  Flame,
  CheckCircle2,
  LucideProps,
} from 'lucide-react';

export const AVAILABLE_TYPE_ICONS: Record<string, React.ComponentType<LucideProps>> = {
  FileText,
  Scale,
  BookOpen,
  Bookmark,
  Users,
  Lightbulb,
  Quote,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  Scroll,
  Compass,
  MessageSquare,
  BookMarked,
  Feather,
  Flame,
  CheckCircle2,
  Tag,
  Folder,
};

interface TypeIconProps {
  name?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function TypeIcon({ name, className = 'w-4 h-4', style }: TypeIconProps) {
  if (!name) return <FileText className={className} style={style} />;

  const IconComponent = AVAILABLE_TYPE_ICONS[name] || FileText;
  return <IconComponent className={className} style={style} />;
}
