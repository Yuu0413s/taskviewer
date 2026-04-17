"use client";

import { useState, useEffect } from "react";
import { TaskType } from "@/lib/db/schema";

interface TaskTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function TaskTypeSelector({
  value,
  onChange,
  disabled,
}: TaskTypeSelectorProps) {
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTaskTypes = async () => {
      try {
        const res = await fetch("/api/task-types");
        if (res.ok) {
          const data = await res.json();
          setTaskTypes(data);
          // 初期値がない場合、最初のタスク種類を選択
          if (!value && data.length > 0) {
            onChange(data[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch task types:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTaskTypes();
  }, [value, onChange]);

  if (loading) {
    return (
      <div className="h-10 w-full animate-pulse rounded-md bg-gray-200" />
    );
  }

  if (taskTypes.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        タスク種類がありません
      </p>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
    >
      {taskTypes.map((type) => (
        <option key={type.id} value={type.id}>
          {type.name}
        </option>
      ))}
    </select>
  );
}
