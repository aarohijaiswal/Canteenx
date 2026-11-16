import { Suspense, type ReactNode } from "react";
import StudentNav from "@/components/StudentNav";

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* the nav reads the session and the cart, so it streams in behind Suspense */}
      <Suspense fallback={<div className="h-[57px] border-b border-neutral-200 dark:border-neutral-700" />}>
        <StudentNav />
      </Suspense>
      <div className="flex flex-1 flex-col">{children}</div>
    </>
  );
}
