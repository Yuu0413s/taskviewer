import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TimeTracker } from "@/components/TimeTracker";
import { UserInfo } from "@/components/UserInfo";

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserInfo />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <TimeTracker />
      </main>
    </div>
  );
}
