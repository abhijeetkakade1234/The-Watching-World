import type { ObjectivePanelContent } from '@/types/objectives';

type Chapter1ObjectiveStage =
  | 'find_finn_house'
  | 'talk_to_finn'
  | 'prepare_for_forest'
  | 'meet_elder_rowan'
  | 'chapter_entry_unlocked';
interface Chapter1PreparationProgress {
  visitedLyraAbode: boolean;
  visitedVillageInn: boolean;
  visitedElderKael: boolean;
}

export function chapter1ObjectiveContent(
  stage: Chapter1ObjectiveStage,
  progress: Chapter1PreparationProgress
): ObjectivePanelContent | null {
  if (stage === 'find_finn_house') {
    return { lines: [{ text: "Finn's house is at left.." }] };
  }

  if (stage === 'talk_to_finn') {
    return { lines: [{ text: 'Talk to Finn' }] };
  }

  if (stage === 'prepare_for_forest') {
    const allCompleted =
      progress.visitedLyraAbode && progress.visitedVillageInn && progress.visitedElderKael;
    if (allCompleted) {
      return { lines: [{ text: 'Meet Elder Rowan [south bridge]' }] };
    }

    return {
      title: 'Prepare before entering the forest:',
      lines: [
        { text: "Talk to Lyra [Lyra's Abode, front-left]", done: progress.visitedLyraAbode },
        { text: 'Visit the Village Inn [front-right]', done: progress.visitedVillageInn },
        { text: 'Talk to Elder Kael [north path]', done: progress.visitedElderKael },
      ],
    };
  }

  if (stage === 'meet_elder_rowan') {
    return { lines: [{ text: 'Meet Elder Rowan [south bridge]' }] };
  }

  if (stage === 'chapter_entry_unlocked') {
    return { lines: [{ text: 'Cross the bridge [chapter entry unlocked]' }] };
  }

  return null;
}
