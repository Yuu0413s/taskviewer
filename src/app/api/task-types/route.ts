import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, categories } from "@/lib/db";
import { eq, or, isNull } from "drizzle-orm";
import { randomUUID } from "crypto";

// GET: カテゴリ一覧を取得
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await db.query.categories.findMany({
      where: or(
        eq(categories.userId, session.user.id),
        isNull(categories.userId)
      ),
      orderBy: (table, { asc }) => [asc(table.name)],
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json(
      { error: "カテゴリの取得に失敗しました" },
      { status: 500 }
    );
  }
}

// POST: 新しいカテゴリを作成
export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, color } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "カテゴリ名は必須です" },
        { status: 400 }
      );
    }

    const id = randomUUID();
    await db.insert(categories).values({
      id,
      userId: session.user.id,
      name,
      color: color || "#3b82f6",
    });

    const newCategory = await db.query.categories.findFirst({
      where: eq(categories.id, id),
    });

    return NextResponse.json(newCategory);
  } catch (error) {
    console.error("Failed to create category:", error);
    return NextResponse.json(
      { error: "カテゴリの作成に失敗しました" },
      { status: 500 }
    );
  }
}
