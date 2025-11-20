import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin'; // Admin SDK 초기화 가정
import { GoogleGenerativeAI } from '@google/generative-ai';
import { calculateEloChange } from '@/lib/elo';
import { UserData, Title, TitleRarity } from '@/types/game';
import { v4 as uuidv4 } from 'uuid';

// Gemini 설정
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
// 요청하신 모델 버전 사용
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

export async function POST(req: NextRequest) {
  try {
    const { myUid, opponentUid } = await req.json();

    if (!myUid || !opponentUid) {
      return NextResponse.json({ error: 'Invalid UIDs' }, { status: 400 });
    }

    // Firestore 트랜잭션 시작
    const result = await adminDb.runTransaction(async (transaction) => {
      // 1. [READ] 모든 읽기 작업을 먼저 수행 (규칙 준수)
      const myRef = adminDb.collection('users').doc(myUid);
      const oppRef = adminDb.collection('users').doc(opponentUid);

      const myDoc = await transaction.get(myRef);
      const oppDoc = await transaction.get(oppRef);

      if (!myDoc.exists || !oppDoc.exists) {
        throw new Error('User not found');
      }

      const myData = myDoc.data() as UserData;
      const oppData = oppDoc.data() as UserData;

      // 쿨타임 체크 (30초)
      const now = Date.now();
      const COOLDOWN = 30 * 1000;
      if (now - (myData.lastBattleTime || 0) < COOLDOWN) {
        throw new Error(`쿨타임 중입니다. ${(COOLDOWN - (now - myData.lastBattleTime)) / 1000}초 남음`);
      }

      // 2. [LOGIC] 배틀 결과 및 칭호 생성 (Gemini 호출)
      // 주의: 트랜잭션 내부에서 외부 API 호출은 지양되나, 
      // 데이터 일관성을 위해 결과를 먼저 만들고 Write단계로 넘어갑니다.
      // 트랜잭션 타임아웃 우려 시 로직 분리가 필요하나, 여기선 흐름상 포함합니다.

      const prompt = `
        두 캐릭터가 텍스트 배틀을 진행합니다.
        
        [플레이어 A]: ${myData.characterName} (보유 칭호: ${myData.titles.find(t => t.isEquipped)?.name || '없음'})
        [플레이어 B]: ${oppData.characterName} (보유 칭호: ${oppData.titles.find(t => t.isEquipped)?.name || '없음'})
        
        결과를 JSON 형식으로 출력하세요.
        1. winner: 'A' 또는 'B'
        2. log: 전투 내용을 5줄 내외의 문자열 배열로. 창의적이고 재미있게.
        3. titlePrompt: 승자에게 부여할 칭호의 키워드 (캐릭터 특성 반영).
      `;

      const battleResultPart = await model.generateContent(prompt);
      const battleText = battleResultPart.response.text();
      // JSON 파싱 로직 (실무에선 더 견고한 파싱 필요)
      const battleJson = JSON.parse(battleText.replace(/```json|```/g, ''));
      
      const isWin = battleJson.winner === 'A';
      const winnerData = isWin ? myData : oppData;
      
      // 칭호 생성 로직 (확률 기반)
      const roll = Math.random() * 100;
      let rarity: TitleRarity = 'NORMAL';
      if (roll < 1) rarity = 'MYTH';
      else if (roll < 5) rarity = 'LEGEND';
      else if (roll < 20) rarity = 'HERO';
      else if (roll < 50) rarity = 'RARE';

      const titleSystemPrompt = `
        당신은 판타지 게임의 칭호 생성기입니다.
        캐릭터 이름: ${winnerData.characterName}
        배틀 키워드: ${battleJson.titlePrompt}
        요청 등급: ${rarity}
        
        다음 등급 설명에 맞춰 20자 이내의 멋진 칭호 하나를 만드세요. 설명은 필요 없습니다.
        * 일반: 평범함.
        * 고급: 약간 특이함.
        * 영웅: 꽤 명예로움.
        * 전설: 역사에 남을 법함.
        * 신화: 신의 영역.
      `;
      
      const titleResultPart = await model.generateContent(titleSystemPrompt);
      const generatedTitleName = titleResultPart.response.text().trim();

      const newTitle: Title = {
        id: uuidv4(),
        name: generatedTitleName,
        rarity: rarity,
        description: `${rarity} 등급의 칭호입니다.`,
        createdAt: now,
        isEquipped: false
      };

      // Elo 계산
      const eloChange = calculateEloChange(myData.elo, oppData.elo, isWin ? 'WIN' : 'LOSE');

      // 3. [WRITE] 모든 쓰기 작업을 마지막에 수행 (규칙 준수)
      
      // 내 데이터 업데이트
      transaction.update(myRef, {
        elo: myData.elo + eloChange,
        titles: isWin ? [...myData.titles, newTitle] : myData.titles,
        win: isWin ? myData.win + 1 : myData.win,
        lose: isWin ? myData.lose : myData.lose + 1,
        lastBattleTime: now,
        gold: myData.gold + (isWin ? 100 : 10) // 승리 보상
      });

      // 상대방 데이터 업데이트
      transaction.update(oppRef, {
        elo: oppData.elo - eloChange,
        lose: isWin ? oppData.lose + 1 : oppData.lose,
        win: isWin ? oppData.win : oppData.win + 1
      });

      return {
        log: battleJson.log,
        winnerUid: isWin ? myUid : opponentUid,
        eloChange,
        newTitle: isWin ? newTitle : null
      };
    });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
