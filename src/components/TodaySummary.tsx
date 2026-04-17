"use client";

import { useState, useEffect, useCallback } from "react";
import { TimeEntryWithTaskType } from "@/lib/db/schema";

interface SummaryItem {
  taskTypeId: string;
  taskTypeName: string;
  taskTypeColor: string;
  totalMinutes: number;
}

interface TodaySummaryProps {
  refreshTrigger?: number;
}

export function TodaySummary({ refreshTrigger }: TodaySummaryProps) {
  const [entries, setEntries] = useState<TimeEntryWithTaskType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(`/api/time-entries?date=${today}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch (error) {
      console.error("Failed to fetch entries:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries, refreshTrigger]);

  const calculateSummary = (): SummaryItem[] => {
    const summaryMap = new Map<string, SummaryItem>();

    entries.forEach((entry) => {
      if (entry.status === "completed" && entry.durationMinutes) {
        const existing = summaryMap.get(entry.taskTypeId);
        if (existing) {
          existing.totalMinutes += entry.durationMinutes;
        } else {
          summaryMap.set(entry.taskTypeId, {
            taskTypeId: entry.taskTypeId,
            taskTypeName: entry.taskType?.name || "不明",
            taskTypeColor: entry.taskType?.color || "#3b82f6",
            totalMinutes: entry.durationMinutes,
          });
        }
      }
    });

    return Array.from(summaryMap.values()).sort(
      (a, b) => b.totalMinutes - a.totalMinutes
    );
  };

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) {
      return `${m}分`;
    }
    return `${h}時間${m}分`;
  };

  const summary = calculateSummary();
  const totalMinutes = summary.reduce((acc, item) => acc + item.totalMinutes, 0);

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="mb-3 font-medium text-gray-900">
        今日の作業時間: {formatDuration(totalMinutes)}
      </h3>

      {summary.length === 0 ? (
        <p className="text-sm text-gray-500">まだ記録がありません</p>
      ) : (
        <div className="space-y-2">
          {summary.map((item) => (
            <div key={item.taskTypeId} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.taskTypeColor }}
              />
              <span className="flex-1 text-sm text-gray-700">
                {item.taskTypeName}
              </span>
              <span className="text-sm font-medium text-gray-900">
                {formatDuration(item.totalMinutes)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
