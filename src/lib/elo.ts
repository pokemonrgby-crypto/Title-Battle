export function calculateEloChange(
  playerElo: number,
  opponentElo: number,
  result: 'WIN' | 'LOSE',
  kFactor: number = 32
): number {
  const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
  const actualScore = result === 'WIN' ? 1 : 0;
  
  // 변화량 반환 (정수)
  return Math.round(kFactor * (actualScore - expectedScore));
}
