'use client';

import { useState } from 'react';
import ActionButton from '@/components/ui/ActionButton';
import { BattleResult } from '@/types/game';

export default function HomePage() {
  const [isBattling, setIsBattling] = useState(false);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [userId, setUserId] = useState('my-test-uid'); // 실제론 Auth Context에서 가져옴

  const handleBattleStart = async () => {
    setIsBattling(true);
    setBattleLog([]); // 로그 초기화

    try {
      // 실제 구현 시에는 매칭 큐 시스템을 통해 상대방 UID를 받아와야 함
      // 여기서는 테스트를 위해 하드코딩된 상대방 ID 사용
      const opponentId = 'opponent-dummy-uid'; 

      const response = await fetch('/api/battle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          myUid: userId,
          opponentUid: opponentId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '배틀 요청 실패');
      }

      const result: BattleResult = await response.json();
      
      // 타이핑 효과처럼 로그를 한 줄씩 보여주기 위한 로직 (선택 사항)
      setBattleLog(result.log);
      
      if (result.newTitle) {
        alert(`축하합니다! [${result.newTitle.name}] 칭호를 획득했습니다!`);
      }

    } catch (error: any) {
      alert(`에러 발생: ${error.message}`);
    } finally {
      setIsBattling(false);
    }
  };

  const handleGoBack = () => {
    // 라우터 뒤로가기 또는 모달 닫기 로직
    console.log('이전 화면으로 이동합니다.');
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        ⚔️ 칭호 배틀 (Title Battle)
      </h1>

      {/* 배틀 로그 영역 */}
      <div className="w-full max-w-2xl bg-gray-800 rounded-xl p-6 min-h-[300px] mb-8 shadow-lg border border-gray-700">
        {battleLog.length === 0 ? (
          <p className="text-gray-500 text-center mt-20">
            배틀 시작 버튼을 눌러 상대를 찾으세요.
          </p>
        ) : (
          <div className="space-y-2">
            {battleLog.map((log, index) => (
              <p key={index} className="text-lg animate-fade-in-up">
                {log}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* 액션 버튼 영역 (규칙 적용됨) */}
      <div className="w-full max-w-md">
        <ActionButton
          label="⚔️ 배틀 시작 (쿨타임 30초)"
          loadingLabel="전투 시뮬레이션 중..."
          onClick={handleBattleStart}
          isLoading={isBattling}
          onBack={handleGoBack}
        />
      </div>
    </main>
  );
}
