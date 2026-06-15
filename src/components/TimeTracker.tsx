"use client";

import { useState, useEffect, useCallback } from "react";
import { Timer } from "./Timer";
import { ControlButtons } from "./ControlButtons";
import { TaskTypeSelector } from "./TaskTypeSelector";
import { TodaySummary } from "./TodaySummary";
import { TimeEntryWithCategory } from "@/lib/db/schema";

type Status = "idle" | "working" | "on_break" | "completed";

export function TimeTracker() {
  const [currentEntry, setCurrentEntry] = useState<TimeEntryWithCategory | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [taskName, setTaskName] = useState("");
  const [plannedDurationMinutes, setPlannedDurationMinutes] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentEntry = useCallback(async () => {
    try {
      const res = await fetch("/api/time-entries/current");
      if (res.ok) {
        const data = await res.json();
        setCurrentEntry(data);
        if (data?.categoryId) {
          setSelectedCategory(data.categoryId);
        }
      }
    } catch (error) {
      console.error("Failed to fetch current entry:", error);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentEntry();
  }, [fetchCurrentEntry]);

  const getStatus = (): Status => {
    if (!currentEntry) return "idle";
    return currentEntry.status as Status;
  };

  const handleStart = async () => {
    if (!selectedCategory) return;

    setError(null);
    setLoading(true);
    try {
      const body: Record<string, unknown> = { categoryId: selectedCategory };
      if (taskName.trim()) body.name = taskName.trim();
      if (plannedDurationMinutes) {
        body.plannedDurationMinutes = parseInt(plannedDurationMinutes, 10);
      }

      const res = await fetch("/api/time-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentEntry(data);
        setTaskName("");
        setPlannedDurationMinutes("");
      } else {
        const errBody = await res.text();
        setError(`エラー (${res.status}): ${errBody}`);
      }
    } catch (error) {
      setError(`通信エラー: ${String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBreak = async () => {
    if (!currentEntry) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/time-entries/${currentEntry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "on_break" }),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentEntry(data);
      }
    } catch (error) {
      console.error("Failed to break:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async () => {
    if (!currentEntry) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/time-entries/${currentEntry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "working" }),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentEntry(data);
      }
    } catch (error) {
      console.error("Failed to resume:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnd = async () => {
    if (!currentEntry) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/time-entries/${currentEntry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });

      if (res.ok) {
        setCurrentEntry(null);
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Failed to end:", error);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  const status = getStatus();

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-gray-200 bg-white p-8">
        <div className="space-y-6">
          <Timer
            startedAt={currentEntry?.startedAt || null}
            status={status}
          />

          {status === "idle" ? (
            <div className="mx-auto max-w-xs space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  タスク名
                </label>
                <input
                  type="text"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="例：週次レポート作成"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  カテゴリ
                </label>
                <TaskTypeSelector
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  disabled={false}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  計画時間（分）
                </label>
                <input
                  type="number"
                  value={plannedDurationMinutes}
                  onChange={(e) => setPlannedDurationMinutes(e.target.value)}
                  placeholder="60"
                  min="1"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="text-center space-y-1">
              {currentEntry?.name && (
                <p className="font-medium text-gray-900">{currentEntry.name}</p>
              )}
              <p className="text-sm text-gray-500">
                {currentEntry?.category?.name}
              </p>
              {currentEntry?.plannedDurationMinutes && (
                <p className="text-xs text-gray-400">
                  計画: {currentEntry.plannedDurationMinutes}分
                </p>
              )}
            </div>
          )}

          <ControlButtons
            status={status}
            onStart={handleStart}
            onBreak={handleBreak}
            onResume={handleResume}
            onEnd={handleEnd}
            loading={loading}
          />

          {error && (
            <p className="text-center text-sm text-red-600">{error}</p>
          )}
        </div>
      </div>

      <TodaySummary refreshTrigger={refreshTrigger} />
    </div>
  );
}
