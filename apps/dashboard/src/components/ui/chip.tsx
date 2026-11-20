import { cn } from '@/lib/utils';

// Figma DS «Chip» (16:359): 40 high pill, label/M; default paper with a line border, selected brand, disabled sand.
export function Chip({ selected, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        'flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-pill border px-s16 text-label-m',
        'disabled:border-sand disabled:bg-sand disabled:text-muted-soft',
        selected ? 'border-brand bg-brand text-paper' : 'border-line bg-paper text-ink',
        className,
      )}
      {...props}
    />
  );
}
