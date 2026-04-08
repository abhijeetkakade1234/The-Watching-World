import type { DynamicEntity } from '@/types/game';

export function isEntityWithinRange(entity: DynamicEntity, x: number, y: number, range = 1): boolean {
  const width = entity.width || 1;
  const height = entity.height || 1;

  const minX = entity.x;
  const maxX = entity.x + width - 1;
  const minY = entity.y;
  const maxY = entity.y + height - 1;

  const nearestX = Math.max(minX, Math.min(x, maxX));
  const nearestY = Math.max(minY, Math.min(y, maxY));

  // Chebyshev distance keeps interaction square-like (matches existing 1-tile neighborhood behavior).
  const distance = Math.max(Math.abs(nearestX - x), Math.abs(nearestY - y));
  return distance <= range;
}
