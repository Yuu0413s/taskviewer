import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, timeEntries } from "@/lib/db";
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

// GET: 作業記録一覧を取得
export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date"); // YYYY-MM-DD形式

    const conditions = [eq(timeEntries.userId, session.user.id)];

    if (date) {
      conditions.push(eq(timeEntries.date, date));
    }

    const entries = await db.query.timeEntries.findMany({
      where: and(...conditions),
      orderBy: [desc(timeEntries.startedAt)],
      with: {
        taskType: true,
      },
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error("Failed to fetch time entries:", error);
    return NextResponse.json(
      { error: "作業記録の取得に失敗しました" },
      { status: 500 }
    );
  }
}

// POST: 新しい作業記録を作成（開始）
export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { taskTypeId, memo } = await request.json();

    if (!taskTypeId) {
      return NextResponse.json(
        { error: "タスク種類は必須です" },
        { status: 400 }
      );
    }

    // 進行中の記録があるかチェック
    const currentEntry = await db.query.timeEntries.findFirst({
      where: and(
        eq(timeEntries.userId, session.user.id),
        eq(timeEntries.status, "working")
      ),
    });

    if (currentEntry) {
      return NextResponse.json(
        { error: "既に進行中の記録があります" },
        { status: 400 }
      );
    }

    const now = new Date();
    const id = randomUUID();
    const date = now.toISOString().split("T")[0]; // YYYY-MM-DD

    await db.insert(timeEntries).values({
      id,
      userId: session.user.id,
      taskTypeId,
      date,
      startedAt: now,
      status: "working",
      memo,
    });

    const newEntry = await db.query.timeEntries.findFirst({
      where: eq(timeEntries.id, id),
      with: {
        taskType: true,
      },
    });

    return NextResponse.json(newEntry);
  } catch (error) {
    console.error("Failed to create time entry:", error);
    return NextResponse.json(
      { error: "作業記録の作成に失敗しました" },
      { status: 500 }
    );
  }
}
