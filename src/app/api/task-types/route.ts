import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, taskTypes } from "@/lib/db";
import { eq, or, isNull } from "drizzle-orm";
import { randomUUID } from "crypto";

// GET: タスク種類一覧を取得
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // ユーザー固有のタスク種類 + 共通のタスク種類（userIdがnull）
    const types = await db.query.taskTypes.findMany({
      where: or(
        eq(taskTypes.userId, session.user.id),
        isNull(taskTypes.userId)
      ),
      orderBy: (taskTypes, { asc }) => [asc(taskTypes.name)],
    });

    return NextResponse.json(types);
  } catch (error) {
    console.error("Failed to fetch task types:", error);
    return NextResponse.json(
      { error: "タスク種類の取得に失敗しました" },
      { status: 500 }
    );
  }
}

// POST: 新しいタスク種類を作成
export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, color } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "タスク種類の名前は必須です" },
        { status: 400 }
      );
    }

    const id = randomUUID();
    await db.insert(taskTypes).values({
      id,
      userId: session.user.id,
      name,
      color: color || "#3b82f6",
    });

    const newType = await db.query.taskTypes.findFirst({
      where: eq(taskTypes.id, id),
    });

    return NextResponse.json(newType);
  } catch (error) {
    console.error("Failed to create task type:", error);
    return NextResponse.json(
      { error: "タスク種類の作成に失敗しました" },
      { status: 500 }
    );
  }
}
