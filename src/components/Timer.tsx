"use client";

import { useState, useEffect } from "react";

interface TimerProps {
  startedAt: Date | null;
  status: "idle" | "working" | "on_break" | "completed";
  totalBreakSeconds: number;
}

export function Timer({ startedAt, status, totalBreakSeconds }: TimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt || status === "idle" || status === "completed") {
      setElapsed(0);
      return;
    }

    const start = new Date(startedAt).getTime();
    const calcElapsed = () =>
      Math.max(0, Math.floor((Date.now() - start) / 1000) - totalBreakSeconds);

    setElapsed(calcElapsed());

    // 作業中のみカウントアップ
    if (status !== "working") {
      return;
    }

    const interval = setInterval(() => {
      setElapsed(calcElapsed());
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt, status, totalBreakSeconds]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getStatusText = () => {
    switch (status) {
      case "working":
        return "作業中";
      case "on_break":
        return "休憩中";
      case "completed":
        return "完了";
      default:
        return "待機中";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "working":
        return "text-green-600";
      case "on_break":
        return "text-yellow-600";
      case "completed":
        return "text-blue-600";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="text-center">
      <div className="text-6xl font-mono font-bold text-gray-900">
        {formatTime(elapsed)}
      </div>
      <div className={`mt-2 text-lg font-medium ${getStatusColor()}`}>
        {getStatusText()}
      </div>
    </div>
  );
}
