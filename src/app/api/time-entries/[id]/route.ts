import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, timeEntries } from "@/lib/db";
import { eq, and } from "drizzle-orm";

// PATCH: 作業記録を更新
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { status, memo } = body;

    // 既存の記録を取得
    const entry = await db.query.timeEntries.findFirst({
      where: and(
        eq(timeEntries.id, id),
        eq(timeEntries.userId, session.user.id)
      ),
    });

    if (!entry) {
      return NextResponse.json(
        { error: "記録が見つかりません" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (memo !== undefined) {
      updateData.memo = memo;
    }

    if (status) {
      updateData.status = status;

      // 終了時の処理
      if (status === "completed") {
        const now = new Date();
        updateData.endedAt = now;

        // 作業時間を計算（分単位）
        const startTime = new Date(entry.startedAt).getTime();
        const endTime = now.getTime();
        updateData.durationMinutes = Math.round((endTime - startTime) / 60000);
      }
    }

    await db
      .update(timeEntries)
      .set(updateData)
      .where(eq(timeEntries.id, id));

    const updatedEntry = await db.query.timeEntries.findFirst({
      where: eq(timeEntries.id, id),
      with: {
        taskType: true,
      },
    });

    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error("Failed to update time entry:", error);
    return NextResponse.json(
      { error: "作業記録の更新に失敗しました" },
      { status: 500 }
    );
  }
}
