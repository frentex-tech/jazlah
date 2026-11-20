import { cn } from '@/lib/utils';

/** «form-section» of 131:24074 and the product form (131:35405): title and body in a 280px column on the start side, the fields beside them. */
export function FormSection({ title, body, invalid, children }: { title: string; body: string; invalid?: boolean; children: React.ReactNode }) {
  return (
    <section className={cn('flex w-full gap-s32 rounded-md border bg-paper p-s24', invalid ? 'border-danger' : 'border-line')}>
      <div className="flex w-[280px] shrink-0 flex-col gap-s8">
        <h2 className="text-h2 text-ink">{title}</h2>
        <p className="text-body-m text-ink-2">{body}</p>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-s20">{children}</div>
    </section>
  );
}
