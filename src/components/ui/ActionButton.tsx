'use client';

import React from 'react';

interface ActionButtonProps {
  label: string;
  loadingLabel?: string;
  onClick: () => Promise<void> | void;
  isLoading: boolean;
  disabled?: boolean;
  onBack?: () => void; // 되돌아가기 버튼용 핸들러
  className?: string;
}

export default function ActionButton({
  label,
  loadingLabel = '처리 중...',
  onClick,
  isLoading,
  disabled = false,
  onBack,
  className = '',
}: ActionButtonProps) {
  return (
    <div className="flex flex-col gap-2 w-full max-w-md mx-auto">
      {/* 메인 액션 버튼 */}
      <button
        onClick={onClick}
        disabled={isLoading || disabled}
        className={`
          w-full px-6 py-3 rounded-lg font-bold text-white transition-all
          ${
            isLoading || disabled
              ? 'bg-gray-500 cursor-not-allowed opacity-70'
              : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
          }
          ${className}
        `}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span> {loadingLabel}
          </span>
        ) : (
          label
        )}
      </button>

      {/* 되돌아가기 / 취소 버튼 (규칙 준수) */}
      {onBack && (
        <button
          onClick={onBack}
          disabled={isLoading} // 로딩 중에는 뒤로가기도 막을지 선택 가능하나, 데이터 꼬임 방지를 위해 막음
          className="w-full px-4 py-2 text-sm text-gray-400 hover:text-white underline decoration-gray-500 underline-offset-4 disabled:opacity-50"
        >
          이전으로 돌아가기
        </button>
      )}
    </div>
  );
}
