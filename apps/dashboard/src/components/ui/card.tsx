import { cn } from '@/lib/utils';

/**
 * Figma DS «Card» (16:749): paper, line border, r18, p16, gap 8, Shadow/Card; H3 title over a Body/M line. The
 * selected state (ember 2 px border) doubles as hover and keyboard focus when the card is a link.
 */
export const cardClass = (interactive = false) =>
  cn(
    'flex flex-col items-start gap-s8 rounded-md border border-line bg-paper p-s16 shadow-card',
    interactive && 'outline-none hover:border-2 hover:border-ember hover:p-[15px] focus-visible:border-2 focus-visible:border-ember focus-visible:p-[15px]',
  );

export function CardText({ title, body }: { title: string; body: string }) {
  return (
    <>
      <span className="text-h3 text-ink">{title}</span>
      <span className="text-body-m text-ink-2">{body}</span>
    </>
  );
}
