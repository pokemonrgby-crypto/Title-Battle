'use client';

import React from 'react';
import { Title } from '@/types/game';
import { getRarityColor, getRarityLabel, getTitleSellPrice, getTitleEnhanceCost, getNextRarity } from '@/lib/utils';

interface TitleCardProps {
  title: Title;
  onSell?: (titleId: string) => void;
  onEnhance?: (titleId: string) => void;
  onEquip?: (titleId: string) => void;
  userGold?: number;
  compact?: boolean;
}

export default function TitleCard({ 
  title, 
  onSell, 
  onEnhance, 
  onEquip, 
  userGold = 0,
  compact = false 
}: TitleCardProps) {
  const rarityColor = getRarityColor(title.rarity);
  const rarityLabel = getRarityLabel(title.rarity);
  const sellPrice = getTitleSellPrice(title.rarity);
  const enhanceCost = getTitleEnhanceCost(title.rarity);
  const nextRarity = getNextRarity(title.rarity);
  const canEnhance = nextRarity !== null && userGold >= enhanceCost;
  
  if (compact) {
    return (
      <div className={`border-2 rounded-lg p-3 ${rarityColor} transition-all hover:scale-105`}>
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs opacity-70">{rarityLabel}</div>
            <div className="font-bold text-sm">{title.name}</div>
          </div>
          {title.isEquipped && (
            <span className="text-xs bg-blue-500 px-2 py-1 rounded">장착중</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`border-2 rounded-xl p-6 ${rarityColor} transition-all hover:shadow-lg`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-sm opacity-70 mb-1">{rarityLabel}</div>
          <h3 className="text-2xl font-bold mb-2">{title.name}</h3>
          <p className="text-sm opacity-80">{title.description}</p>
        </div>
        {title.isEquipped && (
          <span className="bg-blue-500 px-3 py-1 rounded-full text-sm font-bold">
            장착중
          </span>
        )}
      </div>

      <div className="flex gap-2 mt-4">
        {!title.isEquipped && onEquip && (
          <button
            onClick={() => onEquip(title.id)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-bold transition-colors"
          >
            장착
          </button>
        )}
        
        {nextRarity && onEnhance && (
          <button
            onClick={() => onEnhance(title.id)}
            disabled={!canEnhance}
            className={`flex-1 px-4 py-2 rounded-lg font-bold transition-colors ${
              canEnhance
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-gray-600 cursor-not-allowed opacity-50'
            }`}
            title={`${enhanceCost} 골드 필요`}
          >
            강화 ({enhanceCost}G)
          </button>
        )}
        
        {onSell && (
          <button
            onClick={() => onSell(title.id)}
            className="flex-1 bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg font-bold transition-colors"
            title={`${sellPrice} 골드 획득`}
          >
            판매 ({sellPrice}G)
          </button>
        )}
      </div>
    </div>
  );
}
