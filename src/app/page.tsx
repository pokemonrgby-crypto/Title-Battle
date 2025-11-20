'use client';

import { useState } from 'react';
import ActionButton from '@/components/ui/ActionButton';
import { BattleResult, Title } from '@/types/game';

export default function HomePage() {
  const [isBattling, setIsBattling] = useState(false);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  
  // 사용자 입력 상태 관리
  const [myName, setMyName] = useState('모험가');
  const [opponentName, setOpponentName] = useState('슬라임');

  const handleBattleStart = async () => {
    if (!myName.trim() || !opponentName.trim()) {
      alert('캐릭터 이름을 모두 입력해주세요!');
      return;
    }

    setIsBattling(true);
    setBattleLog([]); // 로그 초기화

    try {
      const response = await fetch('/api/battle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          myName: myName,
          opponentName: opponentName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '배틀 요청 실패');
      }

      const result: BattleResult = await response.json();
      
      setBattleLog(result.log);
      
      if (result.newTitle) {
        // 승패 로직에 따라 메시지 다르게 표시 (result.winnerUid가 'me'면 내가 승리)
        if (result.winnerUid === 'me') {
            alert(`승리! [${result.newTitle.name}] (${result.newTitle.rarity}) 칭호를 획득했습니다!`);
        } else {
            alert(`패배했습니다... 상대가 [${result.newTitle.name}] 칭호를 가져갔습니다.`);
        }
      }

    } catch (error: any) {
      alert(`에러 발생: ${error.message}`);
    } finally {
      setIsBattling(false);
    }
  };

  const handleGoBack = () => {
    // 입력 초기화 또는 뒤로가기 동작
    setBattleLog([]);
    console.log('초기화 완료');
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        ⚔️ 칭호 배틀 (Title Battle)
      </h1>

      {/* 캐릭터 설정 입력 영역 */}
      <div className="w-full max-w-md grid grid-cols-2 gap-4 mb-6">
        <div>
            <label className="block text-sm text-gray-400 mb-1">내 캐릭터</label>
            <input 
                type="text" 
                value={myName}
                onChange={(e) => setMyName(e.target.value)}
                disabled={isBattling}
                className="w-full px-3 py-2 bg-gray-800 rounded border border-gray-700 focus:border-blue-500 outline-none transition-colors"
                placeholder="이름 입력"
            />
        </div>
        <div>
            <label className="block text-sm text-gray-400 mb-1">상대 캐릭터</label>
            <input 
                type="text" 
                value={opponentName}
                onChange={(e) => setOpponentName(e.target.value)}
                disabled={isBattling}
                className="w-full px-3 py-2 bg-gray-800 rounded border border-gray-700 focus:border-red-500 outline-none transition-colors"
                placeholder="상대 이름"
            />
        </div>
      </div>

      {/* 배틀 로그 영역 */}
      <div className="w-full max-w-2xl bg-gray-800 rounded-xl p-6 min-h-[300px] mb-8 shadow-lg border border-gray-700 overflow-y-auto max-h-[500px]">
        {battleLog.length === 0 ? (
          <p className="text-gray-500 text-center mt-20">
            캐릭터 이름을 정하고 배틀을 시작하세요.
          </p>
        ) : (
          <div className="space-y-3">
            {battleLog.map((log, index) => (
              <p key={index} className="text-lg animate-fade-in leading-relaxed">
                {log}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* 액션 버튼 영역 */}
      <div className="w-full max-w-md">
        <ActionButton
          label="⚔️ 배틀 시작"
          loadingLabel="AI가 전투 시뮬레이션 중..."
          onClick={handleBattleStart}
          isLoading={isBattling}
          onBack={battleLog.length > 0 ? handleGoBack : undefined} 
        />
      </div>
    </main>
  );
}
