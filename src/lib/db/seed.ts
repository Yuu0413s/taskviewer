import { config } from "dotenv";
config({ path: ".env.local" });
import { db, taskTypes } from "./index";
import { randomUUID } from "crypto";

const defaultTaskTypes = [
  { name: "開発", color: "#3b82f6" },
  { name: "会議", color: "#8b5cf6" },
  { name: "調査", color: "#10b981" },
  { name: "レビュー", color: "#f59e0b" },
  { name: "ドキュメント", color: "#ef4444" },
  { name: "その他", color: "#6b7280" },
];

async function seed() {
  console.log("Seeding default task types...");

  for (const taskType of defaultTaskTypes) {
    await db.insert(taskTypes).values({
      id: randomUUID(),
      userId: null, // 共通のタスク種類
      name: taskType.name,
      color: taskType.color,
    });
  }

  console.log("Seeding completed!");
}

seed()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  })
  .then(() => {
    process.exit(0);
  });
