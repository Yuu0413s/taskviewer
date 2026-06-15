import { config } from "dotenv";
config({ path: ".env.local" });
import { db, categories } from "./index";
import { randomUUID } from "crypto";

const defaultCategories = [
  { name: "開発", color: "#3b82f6" },
  { name: "会議", color: "#8b5cf6" },
  { name: "調査", color: "#10b981" },
  { name: "レビュー", color: "#f59e0b" },
  { name: "ドキュメント", color: "#ef4444" },
  { name: "その他", color: "#6b7280" },
];

async function seed() {
  console.log("Seeding default categories...");

  for (const category of defaultCategories) {
    await db.insert(categories).values({
      id: randomUUID(),
      userId: null,
      name: category.name,
      color: category.color,
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
