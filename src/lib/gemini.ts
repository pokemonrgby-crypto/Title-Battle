import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_API_KEY || '';

export const genAI = new GoogleGenerativeAI(apiKey);

// Use gemini-2.5-flash-lite as required
export const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

export async function generateBattleResult(myName: string, opponentName: string) {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY is not configured');
  }

  const prompt = `
두 캐릭터가 텍스트 배틀을 진행합니다.

[플레이어 A]: ${myName}
[플레이어 B]: ${opponentName}

결과를 JSON 형식으로 출력하세요.
1. winner: 'A' 또는 'B'
2. log: 전투 내용을 5줄 내외의 문자열 배열로. 각 줄은 상황 묘사. 창의적이고 재미있게.
3. titlePrompt: 승자에게 부여할 칭호의 키워드 (캐릭터의 특성이나 전투 스타일 반영).
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  
  // Remove markdown code blocks if present
  const cleanText = text.replace(/```json|```/g, '').trim();
  
  try {
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("JSON Parsing Error", e);
    // Fallback data
    return { 
      winner: 'A', 
      log: ['치열한 전투 끝에 승부가 났습니다!'], 
      titlePrompt: '용기' 
    };
  }
}

export async function generateTitle(winnerName: string, battleKeyword: string, rarity: string) {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY is not configured');
  }

  const rarityDescriptions = {
    NORMAL: '별 볼일 없는 일반 칭호입니다.',
    RARE: '꽤 특이하나 그렇게 유의미하진 않습니다.',
    HERO: '많은 이들이 우러러보는 명예로운 칭호입니다.',
    LEGEND: '역사에 남을 법한 위대한 칭호입니다.',
    MYTH: '신의 영역에 도달한 기적적인 칭호입니다.',
  };

  const prompt = `
당신은 판타지 게임의 칭호 생성기입니다.
캐릭터 이름: ${winnerName}
배틀 키워드: ${battleKeyword}
요청 등급: ${rarity}

다음 등급 설명에 맞춰 20자 이내의 멋진 칭호 하나를 만드세요. 설명은 필요 없고 칭호 텍스트만 출력하세요.
* 일반: ${rarityDescriptions.NORMAL}
* 고급: ${rarityDescriptions.RARE}
* 영웅: ${rarityDescriptions.HERO}
* 전설: ${rarityDescriptions.LEGEND}
* 신화: ${rarityDescriptions.MYTH}
  `;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}
