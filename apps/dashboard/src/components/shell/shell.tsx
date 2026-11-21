import { Toaster } from '@/components/ui/toast';
import type { Panel } from '@/lib/session';
import { SideNav } from './side-nav';
import { TopBar } from './top-bar';

/** Dashboard frame: side nav (260) on the start side, top bar and page content beside it. */
export function Shell({ panel, userName, children }: { panel: Panel; userName: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg">
      <SideNav panel={panel} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar userName={userName} />
        <main className="flex flex-1 flex-col gap-s24 p-s24">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
