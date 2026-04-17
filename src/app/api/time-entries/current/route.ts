import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, timeEntries } from "@/lib/db";
import { eq, and, or } from "drizzle-orm";

// GET: 現在進行中の作業記録を取得
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const currentEntry = await db.query.timeEntries.findFirst({
      where: and(
        eq(timeEntries.userId, session.user.id),
        or(
          eq(timeEntries.status, "working"),
          eq(timeEntries.status, "on_break")
        )
      ),
      with: {
        taskType: true,
      },
    });

    return NextResponse.json(currentEntry || null);
  } catch (error) {
    console.error("Failed to fetch current entry:", error);
    return NextResponse.json(
      { error: "現在の作業記録の取得に失敗しました" },
      { status: 500 }
    );
  }
}
