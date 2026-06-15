"use client";

import { useState, useEffect } from "react";
import { Category } from "@/lib/db/schema";

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/task-types");
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
          // 初期値がない場合、最初のカテゴリを選択
          if (!value && data.length > 0) {
            onChange(data[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [value, onChange]);

  if (loading) {
    return (
      <div className="h-10 w-full animate-pulse rounded-md bg-gray-200" />
    );
  }

  if (categories.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        カテゴリがありません
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
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  );
}
