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
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

    setLoading(true);
    try {
      const res = await fetch("/api/time-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: selectedCategory }),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentEntry(data);
      }
    } catch (error) {
      console.error("Failed to start:", error);
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
        <div className="space-y-8">
          <Timer
            startedAt={currentEntry?.startedAt || null}
            status={status}
          />

          <div className="mx-auto max-w-xs">
            <TaskTypeSelector
              value={selectedCategory}
              onChange={setSelectedCategory}
              disabled={status !== "idle"}
            />
          </div>

          <ControlButtons
            status={status}
            onStart={handleStart}
            onBreak={handleBreak}
            onResume={handleResume}
            onEnd={handleEnd}
            loading={loading}
          />
        </div>
      </div>

      <TodaySummary refreshTrigger={refreshTrigger} />
    </div>
  );
}
