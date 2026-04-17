import Link from "next/link";
import { RegisterForm } from "@/components/RegisterForm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const session = await auth();

  if (session) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">タイムトラッカー</h1>
          <p className="mt-2 text-gray-600">新規アカウントを作成</p>
        </div>
        <div className="rounded-lg bg-white p-8 shadow">
          <RegisterForm />
          <p className="mt-6 text-center text-sm text-gray-600">
            既にアカウントをお持ちの方は{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
