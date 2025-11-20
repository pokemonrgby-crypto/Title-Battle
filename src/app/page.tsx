'use client';

import { useState, useEffect } from 'react';
import ActionButton from '@/components/ui/ActionButton';
import BattleLog from '@/components/ui/BattleLog';
import Modal from '@/components/ui/Modal';
import TitleCard from '@/components/game/TitleCard';
import { BattleResult, Title, UserData } from '@/types/game';
import { getRemainingCooldown, isValidCharacterName, getTitleSellPrice, getNextRarity, getRarityLabel } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

const BATTLE_COOLDOWN = 30; // 30 seconds
const INITIAL_GOLD = 100;
const INITIAL_ELO = 1000;

export default function HomePage() {
  // User data state
  const [userData, setUserData] = useState<UserData>({
    uid: uuidv4(),
    characterName: '',
    elo: INITIAL_ELO,
    gold: INITIAL_GOLD,
    titles: [],
    lastBattleTime: 0,
    win: 0,
    lose: 0,
  });

  // UI states
  const [isBattling, setIsBattling] = useState(false);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [opponentName, setOpponentName] = useState('');
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [showInventory, setShowInventory] = useState(false);
  const [showCharacterSetup, setShowCharacterSetup] = useState(true);

  // Cooldown timer
  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getRemainingCooldown(userData.lastBattleTime, BATTLE_COOLDOWN);
      setCooldownRemaining(remaining);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [userData.lastBattleTime]);

  // Load user data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('titleBattleUserData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserData(parsed);
        if (parsed.characterName) {
          setShowCharacterSetup(false);
        }
      } catch (e) {
        console.error('Failed to load user data', e);
      }
    }
  }, []);

  // Save user data to localStorage
  useEffect(() => {
    localStorage.setItem('titleBattleUserData', JSON.stringify(userData));
  }, [userData]);

  const handleSetupCharacter = () => {
    if (!isValidCharacterName(userData.characterName)) {
      alert('캐릭터 이름은 1~25자여야 합니다!');
      return;
    }
    setShowCharacterSetup(false);
  };

  const handleBattleStart = async () => {
    if (!isValidCharacterName(opponentName)) {
      alert('상대 이름은 1~25자여야 합니다!');
      return;
    }

    if (cooldownRemaining > 0) {
      alert(`배틀 쿨타임이 ${cooldownRemaining}초 남았습니다!`);
      return;
    }

    setIsBattling(true);
    setBattleLog([]);

    try {
      const response = await fetch('/api/battle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          myName: userData.characterName,
          opponentName: opponentName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '배틀 요청 실패');
      }

      const result: BattleResult = await response.json();
      
      setBattleLog(result.log);

      // Update user data based on battle result
      const isWin = result.winnerUid === 'me';
      const eloChange = isWin ? result.eloChange : -result.eloChange;

      setUserData(prev => ({
        ...prev,
        elo: Math.max(0, prev.elo + eloChange),
        win: isWin ? prev.win + 1 : prev.win,
        lose: !isWin ? prev.lose + 1 : prev.lose,
        lastBattleTime: Date.now(),
        titles: result.newTitle && isWin 
          ? [...prev.titles, result.newTitle] 
          : prev.titles,
      }));

      if (result.newTitle && isWin) {
        const rarityLabel = getRarityLabel(result.newTitle.rarity);
        const titleName = result.newTitle.name;
        setTimeout(() => {
          alert(`승리! [${titleName}] (${rarityLabel}) 칭호를 획득했습니다!`);
        }, 500);
      } else if (!isWin) {
        setTimeout(() => {
          alert(`패배했습니다... Elo ${Math.abs(eloChange)} 감소`);
        }, 500);
      }

    } catch (error: any) {
      alert(`에러 발생: ${error.message}`);
    } finally {
      setIsBattling(false);
    }
  };

  const handleSellTitle = (titleId: string) => {
    const title = userData.titles.find(t => t.id === titleId);
    if (!title) return;

    if (title.isEquipped) {
      alert('장착된 칭호는 판매할 수 없습니다!');
      return;
    }

    const sellPrice = getTitleSellPrice(title.rarity);
    if (confirm(`[${title.name}] 칭호를 ${sellPrice} 골드에 판매하시겠습니까?`)) {
      setUserData(prev => ({
        ...prev,
        gold: prev.gold + sellPrice,
        titles: prev.titles.filter(t => t.id !== titleId),
      }));
      alert(`${sellPrice} 골드를 획득했습니다!`);
    }
  };

  const handleEnhanceTitle = (titleId: string) => {
    const title = userData.titles.find(t => t.id === titleId);
    if (!title) return;

    const nextRarity = getNextRarity(title.rarity);
    if (!nextRarity) {
      alert('이미 최고 등급입니다!');
      return;
    }

    const cost = getTitleSellPrice(title.rarity) * 2;
    if (userData.gold < cost) {
      alert(`골드가 부족합니다! (필요: ${cost}, 보유: ${userData.gold})`);
      return;
    }

    if (confirm(`[${title.name}] 칭호를 ${getRarityLabel(nextRarity)} 등급으로 강화하시겠습니까? (${cost} 골드)`)) {
      setUserData(prev => ({
        ...prev,
        gold: prev.gold - cost,
        titles: prev.titles.map(t => 
          t.id === titleId 
            ? { ...t, rarity: nextRarity, description: `${getRarityLabel(nextRarity)} 등급 칭호` }
            : t
        ),
      }));
      alert('칭호가 강화되었습니다!');
    }
  };

  const handleEquipTitle = (titleId: string) => {
    setUserData(prev => ({
      ...prev,
      titles: prev.titles.map(t => ({
        ...t,
        isEquipped: t.id === titleId,
      })),
    }));
    alert('칭호를 장착했습니다!');
  };

  const equippedTitle = userData.titles.find(t => t.isEquipped);

  if (showCharacterSetup) {
    return (
      <main className="min-h-screen bg-gray-900 text-white p-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-md bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700">
          <h1 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            ⚔️ 칭호 배틀
          </h1>
          <p className="text-gray-400 mb-6 text-center">
            칭호를 얻고 강화하며 전투하는 게임
          </p>
          
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">캐릭터 이름 (1~25자)</label>
            <input
              type="text"
              value={userData.characterName}
              onChange={(e) => setUserData(prev => ({ ...prev, characterName: e.target.value }))}
              maxLength={25}
              className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-purple-500 outline-none transition-colors text-lg"
              placeholder="이름을 입력하세요"
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {userData.characterName.length}/25
            </div>
          </div>

          <button
            onClick={handleSetupCharacter}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-lg font-bold text-lg transition-all"
          >
            게임 시작
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 pb-20">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          ⚔️ 칭호 배틀
        </h1>

        {/* User Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <div className="text-xs text-gray-400">캐릭터</div>
            <div className="font-bold truncate">{userData.characterName}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <div className="text-xs text-gray-400">Elo</div>
            <div className="font-bold text-yellow-400">{userData.elo}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <div className="text-xs text-gray-400">골드</div>
            <div className="font-bold text-green-400">{userData.gold} G</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <div className="text-xs text-gray-400">전적</div>
            <div className="font-bold">
              <span className="text-blue-400">{userData.win}</span>
              <span className="text-gray-500"> / </span>
              <span className="text-red-400">{userData.lose}</span>
            </div>
          </div>
        </div>

        {/* Equipped Title */}
        {equippedTitle && (
          <div className="mb-4">
            <TitleCard title={equippedTitle} compact />
          </div>
        )}
      </div>

      {/* Battle Section */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4">배틀</h2>
          
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">상대 이름</label>
            <input
              type="text"
              value={opponentName}
              onChange={(e) => setOpponentName(e.target.value)}
              disabled={isBattling}
              maxLength={25}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-red-500 outline-none transition-colors"
              placeholder="상대 이름 입력 (1~25자)"
            />
          </div>

          <BattleLog logs={battleLog} />

          <div className="mt-4">
            <ActionButton
              label={cooldownRemaining > 0 ? `⏳ 쿨타임 ${cooldownRemaining}초` : "⚔️ 배틀 시작"}
              loadingLabel="AI가 전투 시뮬레이션 중..."
              onClick={handleBattleStart}
              isLoading={isBattling}
              disabled={cooldownRemaining > 0}
            />
          </div>
        </div>
      </div>

      {/* Inventory Button */}
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setShowInventory(true)}
          className="w-full bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-bold transition-colors"
        >
          📦 칭호 인벤토리 ({userData.titles.length})
        </button>
      </div>

      {/* Inventory Modal */}
      <Modal
        isOpen={showInventory}
        onClose={() => setShowInventory(false)}
        title="칭호 인벤토리"
        maxWidth="max-w-4xl"
      >
        {userData.titles.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            보유한 칭호가 없습니다. 배틀에서 승리하여 칭호를 획득하세요!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userData.titles.map(title => (
              <TitleCard
                key={title.id}
                title={title}
                onSell={handleSellTitle}
                onEnhance={handleEnhanceTitle}
                onEquip={handleEquipTitle}
                userGold={userData.gold}
              />
            ))}
          </div>
        )}
      </Modal>
    </main>
  );
}
