import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Title, TitleRarity } from '@/types/game';
import { v4 as uuidv4 } from 'uuid';

// Gemini 설정 (Vercel 환경변수에 GOOGLE_API_KEY 설정 필수)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

export async function POST(req: NextRequest) {
  try {
    // DB가 없으므로 클라이언트에서 직접 이름과 등급 정보를 받습니다.
    // (실제 게임에선 보안상 검증이 필요하지만, 지금은 프로토타입이므로 허용)
    const { myName, opponentName } = await req.json();

    if (!myName || !opponentName) {
      return NextResponse.json({ error: 'Names are required' }, { status: 400 });
    }

    // 1. [LOGIC] 배틀 시뮬레이션 (Gemini 호출)
    const prompt = `
      두 캐릭터가 텍스트 배틀을 진행합니다.
      
      [플레이어 A]: ${myName}
      [플레이어 B]: ${opponentName}
      
      결과를 JSON 형식으로 출력하세요.
      1. winner: 'A' 또는 'B'
      2. log: 전투 내용을 5줄 내외의 문자열 배열로. 각 줄은 상황 묘사. 창의적이고 재미있게.
      3. titlePrompt: 승자에게 부여할 칭호의 키워드 (캐릭터의 특성이나 전투 스타일 반영).
    `;

    const battleResultPart = await model.generateContent(prompt);
    const battleText = battleResultPart.response.text();
    
    // JSON 파싱 (마크다운 제거 후 파싱)
    const cleanText = battleText.replace(/```json|```/g, '').trim();
    let battleJson;
    try {
        battleJson = JSON.parse(cleanText);
    } catch (e) {
        // 파싱 실패 시 비상용 더미 데이터
        console.error("JSON Parsing Error", e);
        battleJson = { winner: 'A', log: ['치열한 전투 끝에 승부가 났습니다!'], titlePrompt: '용기' };
    }

    // 2. 칭호 생성 로직 (확률 기반)
    const roll = Math.random() * 100;
    let rarity: TitleRarity = 'NORMAL';
    if (roll < 1) rarity = 'MYTH';
    else if (roll < 5) rarity = 'LEGEND';
    else if (roll < 20) rarity = 'HERO';
    else if (roll < 50) rarity = 'RARE';

    const winnerName = battleJson.winner === 'A' ? myName : opponentName;

    const titleSystemPrompt = `
      당신은 판타지 게임의 칭호 생성기입니다.
      캐릭터 이름: ${winnerName}
      배틀 키워드: ${battleJson.titlePrompt}
      요청 등급: ${rarity}
      
      다음 등급 설명에 맞춰 20자 이내의 멋진 칭호 하나를 만드세요. 설명은 필요 없고 칭호 텍스트만 출력하세요.
      * 일반: 별 볼일 없는 일반 칭호입니다.
      * 고급: 꽤 특이하나 그렇게 유의미하진 않습니다.
      * 영웅: 많은 이들이 우러러보는 명예로운 칭호입니다.
      * 전설: 역사에 남을 법한 위대한 칭호입니다.
      * 신화: 신의 영역에 도달한 기적적인 칭호입니다.
    `;
    
    const titleResultPart = await model.generateContent(titleSystemPrompt);
    const generatedTitleName = titleResultPart.response.text().trim();

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
