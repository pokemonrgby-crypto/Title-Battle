export type TitleRarity = 'NORMAL' | 'RARE' | 'HERO' | 'LEGEND' | 'MYTH';

export interface Title {
  id: string;
  name: string;
  rarity: TitleRarity;
  description: string; // "별 볼일 없는..." 등
  createdAt: number;
  isEquipped: boolean;
}

export interface UserData {
  uid: string;
  characterName: string;
  elo: number;
  gold: number; // 칭호 판매/강화용 재화
  titles: Title[];
  lastBattleTime: number; // 쿨타임 계산용 (Timestamp)
  win: number;
  lose: number;
}

export interface BattleResult {
  log: string[]; // 줄바꿈 된 전투 로그
  winnerUid: string;
  loserUid: string;
  eloChange: number;
  newTitle: Title | null; // 배틀 결과로 획득한 칭호 (없을 수도 있음)
}

export const RARITY_WEIGHTS = {
  NORMAL: 50,
  RARE: 30,
  HERO: 15,
  LEGEND: 4,
  MYTH: 1
};
