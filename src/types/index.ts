import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
  }
}

// アプリケーション固有の型
export type TimeEntryStatus = "working" | "on_break" | "completed";

export interface TimeEntrySummary {
  taskTypeId: string;
  taskTypeName: string;
  taskTypeColor: string;
  totalMinutes: number;
}
