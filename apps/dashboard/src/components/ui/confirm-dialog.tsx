'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useTranslations } from 'next-intl';
import { Button } from './button';

// Figma DS «Dialog» (16:579): default and destructive.
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  body,
  confirmLabel,
  destructive,
  loading,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  body: string;
  confirmLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
}) {
  const t = useTranslations('dialog');
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-scrim/55" />
        <Dialog.Content className="fixed start-1/2 top-1/2 flex w-[320px] -translate-y-1/2 flex-col gap-s16 rounded-lg border border-line bg-paper p-s24 shadow-card ltr:-translate-x-1/2 rtl:translate-x-1/2">
          <Dialog.Title className="text-h2 text-ink">{title}</Dialog.Title>
          <Dialog.Description className="text-body-m text-ink-2">{body}</Dialog.Description>
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
