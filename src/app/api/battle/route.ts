import { NextRequest, NextResponse } from 'next/server';
import { Title, TitleRarity } from '@/types/game';
import { v4 as uuidv4 } from 'uuid';
import { generateBattleResult, generateTitle } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    // DB가 없으므로 클라이언트에서 직접 이름과 등급 정보를 받습니다.
    // (실제 게임에선 보안상 검증이 필요하지만, 지금은 프로토타입이므로 허용)
    const { myName, opponentName } = await req.json();

    if (!myName || !opponentName) {
      return NextResponse.json({ error: 'Names are required' }, { status: 400 });
    }

    // 1. [LOGIC] 배틀 시뮬레이션 (Gemini 호출)
    const battleJson = await generateBattleResult(myName, opponentName);

    // 2. 칭호 생성 로직 (확률 기반)
    const roll = Math.random() * 100;
    let rarity: TitleRarity = 'NORMAL';
    if (roll < 1) rarity = 'MYTH';
    else if (roll < 5) rarity = 'LEGEND';
    else if (roll < 20) rarity = 'HERO';
    else if (roll < 50) rarity = 'RARE';

    const winnerName = battleJson.winner === 'A' ? myName : opponentName;

    const generatedTitleName = await generateTitle(winnerName, battleJson.titlePrompt, rarity);

    const newTitle: Title = {
      id: uuidv4(),
      name: generatedTitleName,
      rarity: rarity,
      description: `${rarity} 등급 칭호`,
      createdAt: Date.now(),
      isEquipped: false
    };

    // DB 저장 과정 없이 결과만 반환
    return NextResponse.json({
      log: battleJson.log,
      winnerUid: battleJson.winner === 'A' ? 'me' : 'opponent', // 프론트 로직 호환을 위해 임시 ID 사용
      eloChange: 15, // DB가 없으므로 고정값 혹은 임의값
      newTitle: newTitle
    });

  } catch (error: any) {
    console.error('Battle API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
