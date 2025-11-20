import { TitleRarity } from '@/types/game';

/**
 * Get rarity color classes for Tailwind
 */
export function getRarityColor(rarity: TitleRarity): string {
  switch (rarity) {
    case 'MYTH':
      return 'text-purple-500 border-purple-500 bg-purple-900/20';
    case 'LEGEND':
      return 'text-orange-500 border-orange-500 bg-orange-900/20';
    case 'HERO':
      return 'text-blue-500 border-blue-500 bg-blue-900/20';
    case 'RARE':
      return 'text-green-500 border-green-500 bg-green-900/20';
    case 'NORMAL':
    default:
      return 'text-gray-400 border-gray-500 bg-gray-800/20';
  }
}

/**
 * Get rarity text label in Korean
 */
export function getRarityLabel(rarity: TitleRarity): string {
  switch (rarity) {
    case 'MYTH':
      return '신화';
    case 'LEGEND':
      return '전설';
    case 'HERO':
      return '영웅';
    case 'RARE':
      return '고급';
    case 'NORMAL':
    default:
      return '일반';
  }
}

/**
 * Calculate title sell price based on rarity
 */
export function getTitleSellPrice(rarity: TitleRarity): number {
  switch (rarity) {
    case 'MYTH':
      return 1000;
    case 'LEGEND':
      return 500;
    case 'HERO':
      return 200;
    case 'RARE':
      return 50;
    case 'NORMAL':
    default:
      return 10;
  }
}

/**
 * Calculate title enhancement cost
 */
export function getTitleEnhanceCost(rarity: TitleRarity): number {
  switch (rarity) {
    case 'MYTH':
      return 0; // Cannot enhance MYTH
    case 'LEGEND':
      return 800;
    case 'HERO':
      return 400;
    case 'RARE':
      return 150;
    case 'NORMAL':
    default:
      return 50;
  }
}

/**
 * Get next rarity tier
 */
export function getNextRarity(rarity: TitleRarity): TitleRarity | null {
  switch (rarity) {
    case 'NORMAL':
      return 'RARE';
    case 'RARE':
      return 'HERO';
    case 'HERO':
      return 'LEGEND';
    case 'LEGEND':
      return 'MYTH';
    case 'MYTH':
    default:
      return null; // Cannot upgrade further
  }
}

/**
 * Format timestamp to readable date
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('ko-KR');
}

/**
 * Calculate remaining cooldown time in seconds
 */
export function getRemainingCooldown(lastBattleTime: number, cooldownSeconds: number = 30): number {
  const now = Date.now();
  const elapsed = (now - lastBattleTime) / 1000;
  const remaining = Math.max(0, cooldownSeconds - elapsed);
  return Math.ceil(remaining);
}

/**
 * Check if character name is valid (max 25 characters)
 */
export function isValidCharacterName(name: string): boolean {
  return name.trim().length > 0 && name.trim().length <= 25;
}
