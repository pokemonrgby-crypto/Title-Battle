'use client';

import React from 'react';

interface BattleLogProps {
  logs: string[];
}

export default function BattleLog({ logs }: BattleLogProps) {
  if (logs.length === 0) {
    return (
      <div className="w-full max-w-2xl bg-gray-800 rounded-xl p-6 min-h-[300px] shadow-lg border border-gray-700">
        <p className="text-gray-500 text-center mt-20">
          캐릭터 이름을 정하고 배틀을 시작하세요.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl bg-gray-800 rounded-xl p-6 min-h-[300px] max-h-[500px] shadow-lg border border-gray-700 overflow-y-auto">
      <div className="space-y-3">
        {logs.map((log, index) => (
          <p 
            key={index} 
            className="text-lg animate-fade-in leading-relaxed"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {log}
          </p>
        ))}
      </div>
    </div>
  );
}
