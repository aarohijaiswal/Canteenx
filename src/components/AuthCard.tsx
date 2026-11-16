import type { ReactNode } from "react";

export default function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mb-6 mt-1 text-sm text-neutral-600 dark:text-neutral-400">{subtitle}</p>
        {children}
      </div>
    </main>
  );
}
