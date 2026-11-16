import LogoutButton from "./LogoutButton";

export default function AppHeader({ name, role }: { name: string; role: string }) {
  return (
    <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-3 dark:border-neutral-700">
      <span className="text-lg font-bold text-emerald-700">CanteenX</span>
      <div className="flex items-center gap-4">
        <span className="text-sm">
          {name} <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs font-medium dark:bg-neutral-800">{role}</span>
        </span>
        <LogoutButton />
      </div>
    </header>
  );
}
