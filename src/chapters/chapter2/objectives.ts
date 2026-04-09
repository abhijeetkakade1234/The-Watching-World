import type { ObjectivePanelContent } from '@/types/objectives';

export type Chapter2ObjectiveStage = 'intro' | 'first_step' | 'unknown_trail';

export function chapter2ObjectiveContent(stage: Chapter2ObjectiveStage): ObjectivePanelContent | null {
  if (stage === 'intro') {
    return { lines: [{ text: 'Reach the old bridge campfire [placeholder]' }] };
  }

  if (stage === 'first_step') {
    return { lines: [{ text: 'Search the forest edge for clues [placeholder]' }] };
  }

  if (stage === 'unknown_trail') {
    return {
      title: 'Chapter 2 tasks:',
      lines: [
        { text: 'Scout the trail markers [placeholder]' },
        { text: 'Find a safe resting spot [placeholder]' },
      ],
    };
  }

  return null;
}

