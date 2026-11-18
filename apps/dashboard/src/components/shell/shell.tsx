import { getTranslations } from 'next-intl/server';
import type { Panel } from '@/lib/session';
import { SideNav } from './side-nav';
import { TopBar } from './top-bar';

/** Dashboard frame: side nav (260) on the start side, top bar and page content beside it. */
export async function Shell({ panel, userName, children }: { panel: Panel; userName: string; children: React.ReactNode }) {
  const t = await getTranslations('panelInitial');
  return (
    <div className="flex min-h-screen bg-bg">
      <SideNav panel={panel} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar userName={userName} initial={t(panel)} />
        <main className="flex flex-1 flex-col gap-s24 p-s24">{children}</main>
      </div>
    </div>
  );
}

/** Content placeholder for pages whose body is built by a later task. */
export function Placeholder({ text }: { text: string }) {
  return (
    <div className="flex min-h-[400px] w-full items-center justify-center rounded-md border border-dashed border-line bg-paper text-body-m text-muted">
      {text}
    </div>
  );
}
