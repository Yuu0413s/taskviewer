"use client";

import { useLayoutEffect, useState } from "react";

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
  // Date.now() はレンダー中に直接呼べない（react-hooks/purity）ので、
  // setState は必ず「effectのコールバック（interval / cleanup）の中」でのみ呼ぶ。
  //
  // useEffect ではなく useLayoutEffect を使っているのは、useEffect（passive effect）は
  // ブラウザが描画した後に実行されるため、on_break <-> working の切り替わり時に
  // 「古い now のまま1フレームだけ描画される」瞬間が理論上発生するため。
  // useLayoutEffect は描画前に同期実行されるので、この1フレームのズレ自体を無くせる。
  const [now, setNow] = useState<number>(() => Date.now());

  // 実行中: interval で1秒ごとに更新し、停止した瞬間（cleanup）に最後の値を合わせる。
  useLayoutEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearInterval(id);
      // on_break へ切り替わった瞬間の時刻に合わせる。
      // これが無いと直前の interval tick の時刻のまま最大1秒表示が止まって見える。
      setNow(Date.now());
    };
  }, [isRunning]);

  // 停止中: 何もしないが、再開した瞬間（cleanup）に now を合わせる。
  // これが無いと working へ復帰した瞬間、更新済みの totalBreakSeconds を
  // 休憩開始時刻のままの古い now から差し引いてしまい、一時的に表示が減って見える。
  useLayoutEffect(() => {
    if (isRunning) return;
    return () => {
      setNow(Date.now());
    };
  }, [isRunning]);

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
