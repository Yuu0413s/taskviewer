"use client";

import { useState } from "react";

interface TimeDeviationModalProps {
  plannedMinutes: number;
  actualMinutes: number;
  onSubmit: (focused: boolean, reason: string) => void;
}

export function TimeDeviationModal({
  plannedMinutes,
  actualMinutes,
  onSubmit,
}: TimeDeviationModalProps) {
  const [focused, setFocused] = useState<boolean | null>(null);
  const [reason, setReason] = useState("");

  const diff = actualMinutes - plannedMinutes;
  const diffAbs = Math.abs(diff);
  const diffLabel = diff > 0 ? `${diffAbs}分 超過` : `${diffAbs}分 短縮`;

  const canSubmit = focused !== null && reason.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit || focused === null) return;
    onSubmit(focused, reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-1 text-lg font-semibold text-gray-900">
          時間の乖離があります
        </h2>
        <p className="mb-5 text-sm text-gray-500">
          計画 {plannedMinutes}分 → 実績 {actualMinutes}分（{diffLabel}）
        </p>

        <p className="mb-3 text-sm font-medium text-gray-700">
          集中して取り組めましたか？
        </p>
        <div className="mb-5 flex gap-3">
          <button
            onClick={() => setFocused(true)}
            className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
              focused === true
                ? "border-green-500 bg-green-50 text-green-700"
                : "border-gray-300 text-gray-600 hover:border-gray-400"
            }`}
          >
            集中できた
          </button>
          <button
            onClick={() => setFocused(false)}
            className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
              focused === false
                ? "border-red-400 bg-red-50 text-red-700"
                : "border-gray-300 text-gray-600 hover:border-gray-400"
            }`}
          >
            集中できなかった
          </button>
        </div>

        {focused !== null && (
          <div className="mb-5">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              理由<span className="ml-1 text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                focused
                  ? "例：タスクの見通しが良かった、集中できる環境だった..."
                  : "例：会議が入った、調べ物が増えた..."
              }
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40"
        >
          記録して終了
        </button>
      </div>
    </div>
  );
}
