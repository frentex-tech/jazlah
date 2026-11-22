import { cn } from '@/lib/utils';

/**
 * «form-section» of 131:24074 and the product form (131:35405): title and body in a 280px column on the start side, the
 * fields beside them. `hug` (the Sprint 3 frames, 118:11181): the two columns hug their content and pack to the end side,
 * so the spare width sits before the title.
 */
export function FormSection({ title, body, invalid, hug, children }: { title: string; body: string; invalid?: boolean; hug?: boolean; children: React.ReactNode }) {
  return (
    <section className={cn('flex w-full gap-s32 rounded-md border bg-paper p-s24', invalid ? 'border-danger' : 'border-line', hug && 'justify-end')}>
      <div className="flex w-[280px] shrink-0 flex-col gap-s8">
        <h2 className="text-h2 text-ink">{title}</h2>
        <p className="text-body-m text-ink-2">{body}</p>
      </div>
      {/* Hugging, the fields are at least the frame's two 342px columns wide, so a short section lines up with the others. */}
      <div className={cn('flex flex-col gap-s20', hug ? 'min-w-[708px] flex-initial' : 'min-w-0 flex-1')}>{children}</div>
    </section>
  );
}
