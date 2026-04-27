import { Suspense } from "react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Suspense>
        <Sidebar />
      </Suspense>
      <main className="flex-1 pb-16 md:pb-0 overflow-y-auto">{children}</main>
      <BottomNav />
    </div>
  );
}
