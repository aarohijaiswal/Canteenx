import { Suspense, type ReactNode } from "react";
import StaffNav from "@/components/StaffNav";

export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Suspense fallback={<div className="h-[57px] border-b border-neutral-200 dark:border-neutral-700" />}>
        <StaffNav />
      </Suspense>
      <div className="flex flex-1 flex-col">{children}</div>
    </>
  );
}
