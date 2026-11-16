import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-5 p-8 text-center">
      <h1 className="text-4xl font-bold tracking-tight">CanteenX</h1>
      <p className="max-w-md text-lg text-neutral-600 dark:text-neutral-300">
        Smart college canteen management: order food, track your order, and keep the kitchen stocked.
      </p>
      <div className="flex gap-3">
        <Link href="/login" className="rounded-md bg-emerald-700 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-800">Sign in</Link>
        <Link href="/register" className="rounded-md border border-neutral-300 px-5 py-2 text-sm font-semibold hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-800">Create account</Link>
      </div>
    </main>
  );
}
