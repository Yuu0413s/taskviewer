"use client";

import { useEffect, useState } from "react";

interface TimerProps {
  startedAt: Date | null;
  status: "idle" | "working" | "on_break" | "completed";
  totalBreakSeconds: number;
}

export function Timer({ startedAt, status, totalBreakSeconds }: TimerProps) {
  const isActive =
    Boolean(startedAt) && status !== "idle" && status !== "completed";
  const isRunning = isActive && status === "working";

  // state に持つのは「現在時刻」だけ。経過秒は毎レンダーで計算する（導出状態）。
  // こうすると setElapsed() を effect の本体で呼ぶ必要がなくなり、
  // react-hooks/set-state-in-effect のエラーが解消される。
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!isRunning) return;
    // setState は effect の本体ではなく、コールバックの中で呼ぶのがルール
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  // setInterval のカウントを積み上げず、毎回 Date.now() との差分を取り直す。
  // これによりタブがバックグラウンドに回って間引かれてもズレない。
  const elapsed = (() => {
    if (!startedAt || !isActive) return 0;
    const start = new Date(startedAt).getTime();
    return Math.max(0, Math.floor((now - start) / 1000) - totalBreakSeconds);
  })();

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
      {/* スマホでは 6xl だと桁があふれるので段階的に大きくする */}
      <div className="font-mono text-4xl font-bold tabular-nums text-gray-900 sm:text-5xl md:text-6xl">
        {formatTime(elapsed)}
      </div>
      <div className={`mt-2 text-base font-medium sm:text-lg ${getStatusColor()}`}>
        {getStatusText()}
      </div>
    </div>
  );
}
