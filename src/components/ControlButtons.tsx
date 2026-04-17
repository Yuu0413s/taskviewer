"use client";

interface ControlButtonsProps {
  status: "idle" | "working" | "on_break" | "completed";
  onStart: () => void;
  onBreak: () => void;
  onResume: () => void;
  onEnd: () => void;
  loading?: boolean;
}

export function ControlButtons({
  status,
  onStart,
  onBreak,
  onResume,
  onEnd,
  loading,
}: ControlButtonsProps) {
  return (
    <div className="flex justify-center gap-4">
      {status === "idle" && (
        <button
          onClick={onStart}
          disabled={loading}
          className="rounded-lg bg-green-600 px-8 py-3 text-lg font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? "開始中..." : "開始"}
        </button>
      )}

      {status === "working" && (
        <>
          <button
            onClick={onBreak}
            disabled={loading}
            className="rounded-lg bg-yellow-500 px-8 py-3 text-lg font-medium text-white hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? "..." : "休憩"}
          </button>
          <button
            onClick={onEnd}
            disabled={loading}
            className="rounded-lg bg-red-600 px-8 py-3 text-lg font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? "..." : "終了"}
          </button>
        </>
      )}

      {status === "on_break" && (
        <>
          <button
            onClick={onResume}
            disabled={loading}
            className="rounded-lg bg-green-600 px-8 py-3 text-lg font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? "..." : "再開"}
          </button>
          <button
            onClick={onEnd}
            disabled={loading}
            className="rounded-lg bg-red-600 px-8 py-3 text-lg font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? "..." : "終了"}
          </button>
        </>
      )}
    </div>
  );
}
