"use client";

import { useSession, signOut } from "next-auth/react";

export function UserInfo() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || "ユーザー"}
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-medium text-white">
            {session.user.name?.charAt(0) || "U"}
          </div>
        )}
        <span className="font-medium text-gray-900">
          {session.user.name || session.user.email}
        </span>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        ログアウト
      </button>
    </div>
  );
}
