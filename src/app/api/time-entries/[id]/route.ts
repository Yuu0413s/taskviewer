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
    const { status, memo, deviationFocused, deviationReason } = body;

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

    if (deviationFocused !== undefined) {
      updateData.deviationFocused = deviationFocused;
    }

    if (deviationReason !== undefined) {
      updateData.deviationReason = deviationReason;
    }

    if (status) {
      updateData.status = status;

      if (status === "on_break") {
        updateData.breakStartedAt = new Date();
      } else if (status === "working") {
        // 休憩再開: 今回の休憩時間を累積に加算して breakStartedAt をリセット
        if (entry.breakStartedAt) {
          const breakDuration = Math.round(
            (Date.now() - new Date(entry.breakStartedAt).getTime()) / 1000
          );
          updateData.totalBreakSeconds = (entry.totalBreakSeconds ?? 0) + breakDuration;
          updateData.breakStartedAt = null;
        }
      } else if (status === "completed") {
        const now = new Date();
        updateData.endedAt = now;

        // 休憩中に終了した場合も含め累積休憩秒数を確定
        let totalBreakSec = entry.totalBreakSeconds ?? 0;
        if (entry.breakStartedAt) {
          totalBreakSec += Math.round(
            (now.getTime() - new Date(entry.breakStartedAt).getTime()) / 1000
          );
          updateData.breakStartedAt = null;
        }
        updateData.totalBreakSeconds = totalBreakSec;

        // 実作業時間を計算（休憩時間を除く）
        const totalSeconds = Math.round(
          (now.getTime() - new Date(entry.startedAt).getTime()) / 1000
        );
        updateData.durationMinutes = Math.round((totalSeconds - totalBreakSec) / 60);
      }
    }

    await db
      .update(timeEntries)
      .set(updateData)
      .where(eq(timeEntries.id, id));

    const updatedEntry = await db.query.timeEntries.findFirst({
      where: eq(timeEntries.id, id),
      with: {
        category: true,
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
