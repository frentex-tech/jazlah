import { cn } from '@/lib/utils';
import { StatePanel, type StatePanelKind } from './state-panel';

/**
 * The page-body state of the shell frames (135:46966 empty, 135:47170 error, 135:47334 denied): a paper card with the
 * line border, r18, 480 high (or as `className` sets), the State panel (16:877) centred in it.
 */
export function StateCard({ className, ...props }: { kind: StatePanelKind; title: string; body: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex h-[480px] w-full items-center justify-center rounded-md border border-line bg-paper', className)}>
      <StatePanel {...props} />
    </div>
  );
}
