'use client';

import type { ObjectivePanelContent } from '@/types/objectives';

interface ChapterObjectivePanelProps {
  label?: string;
  content: ObjectivePanelContent | null;
}

export function ChapterObjectivePanel({ label = 'Objective', content }: ChapterObjectivePanelProps) {
  if (!content || content.lines.length === 0) return null;

  return (
    <aside className="pointer-events-none fixed left-4 top-4 z-[220] max-w-xs rounded-md border border-cyan-200/20 bg-black/65 p-4 text-slate-100 shadow-xl backdrop-blur-sm sm:left-6 sm:top-6">
      <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-cyan-300/90">{label}</p>

      {content.title && (
        <p className="mb-2 text-sm font-semibold leading-relaxed">{content.title}</p>
      )}
      <div className="space-y-2 text-sm leading-relaxed">
        {content.lines.map((line, index) => (
          <p key={`${line.text}-${index}`} className={line.done ? 'text-emerald-300' : undefined}>
            {line.done ? '[x]' : '[ ]'} {line.text}
          </p>
        ))}
      </div>
    </aside>
  );
}
