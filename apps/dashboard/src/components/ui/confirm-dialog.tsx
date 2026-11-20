'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Button } from './button';

// Figma DS «Dialog» (16:579): default and destructive. `children` (a form field) go between the text and the buttons;
// such dialogs are 520 wide, as in the review dialogs (131:19351).
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  body,
  confirmLabel,
  destructive,
  loading,
  onConfirm,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  body: string;
  confirmLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  children?: React.ReactNode;
}) {
  const t = useTranslations('dialog');
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-scrim/55" />
        <Dialog.Content className={cn('fixed start-1/2 top-1/2 flex -translate-y-1/2 flex-col gap-s16 rounded-lg border border-line bg-paper p-s24 shadow-card ltr:-translate-x-1/2 rtl:translate-x-1/2', children ? 'w-[520px]' : 'w-[320px]')}>
          <Dialog.Title className="text-h2 text-ink">{title}</Dialog.Title>
          <Dialog.Description className="text-body-m text-ink-2">{body}</Dialog.Description>
          {children}
          <div className="flex gap-s12">
            <Button variant={destructive ? 'danger' : 'primary'} className="flex-1" loading={loading} onClick={onConfirm}>
              {confirmLabel ?? (destructive ? t('delete') : t('confirm'))}
            </Button>
            <Dialog.Close asChild>
              <Button variant="secondary" className="flex-1">
                {t('cancel')}
              </Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
