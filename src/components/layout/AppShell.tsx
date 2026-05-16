import { Suspense } from "react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { MobileContactsBar } from "./MobileContactsBar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Suspense>
        <Sidebar />
      </Suspense>
      <div className="flex-1 flex flex-col min-w-0">
        <Suspense>
          <MobileContactsBar />
        </Suspense>
        <main className="flex-1 pb-16 md:pb-0 overflow-y-auto">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
