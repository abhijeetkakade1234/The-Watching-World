'use client';

import { PIXEL_HUD } from '@/styles/pixelHud';
import type { ObjectivePanelContent } from '@/types/objectives';

interface ChapterObjectivePanelProps {
  label?: string;
  content: ObjectivePanelContent | null;
}

export function ChapterObjectivePanel({ label = 'Objective', content }: ChapterObjectivePanelProps) {
  if (!content || content.lines.length === 0) return null;

  return (
    <aside className={`pointer-events-none fixed left-4 top-4 z-[220] max-w-xs p-4 sm:left-6 sm:top-6 ${PIXEL_HUD.panelMuted}`}>
      <p className={`mb-2 text-[10px] ${PIXEL_HUD.heading}`}>{label}</p>

      {content.title && (
        <p className={`mb-2 text-sm leading-relaxed ${PIXEL_HUD.text}`}>{content.title}</p>
      )}
      <div className="space-y-2 text-sm leading-relaxed">
        {content.lines.map((line, index) => (
          <p key={`${line.text}-${index}`} className={line.done ? 'text-[#99ca63] font-mono' : PIXEL_HUD.text}>
            {line.done ? '[x]' : '[ ]'} {line.text}
          </p>
        ))}
      </div>
    </aside>
  );
}
