'use client';

import { CheckCircle, Paperclip, X } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from './spinner';

export type UploadTicket = { mediaId: string; url: string; fields: Record<string, string> };

type Status = { kind: 'idle' } | { kind: 'uploading'; name: string } | { kind: 'done'; name: string } | { kind: 'error'; name?: string };

/**
 * Presigned upload (docs/frontend/uploads.md): ask for a ticket, POST the file straight to storage, then confirm.
 * The ticket and confirm calls are the caller's (they go through the API with the user's session).
 */
export async function uploadWithTicket(file: File, ticket: UploadTicket): Promise<void> {
  const form = new FormData();
  for (const [k, v] of Object.entries(ticket.fields)) form.append(k, v); // every field, unchanged, first
  form.append('file', file); // the file last, named "file"
  const res = await fetch(ticket.url, { method: 'POST', body: form }); // no Authorization: this is storage
  if (res.status !== 204) throw new Error(`storage answered ${res.status}`);
}

export function FileUpload({
  accept,
  label,
  requestTicket,
  confirm,
  onUploaded,
  onRemove,
}: {
  accept?: string;
  label: string;
  requestTicket: (file: File) => Promise<UploadTicket>;
  confirm: (mediaId: string) => Promise<void>;
  onUploaded: (mediaId: string) => void;
  onRemove?: () => void;
}) {
  const t = useTranslations('upload');
  const input = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  async function handle(file: File) {
    setStatus({ kind: 'uploading', name: file.name });
    try {
      const ticket = await requestTicket(file);
      await uploadWithTicket(file, ticket);
      await confirm(ticket.mediaId);
      setStatus({ kind: 'done', name: file.name });
      onUploaded(ticket.mediaId);
    } catch {
      setStatus({ kind: 'error', name: file.name });
    }
  }

  return (
    <div className="flex flex-col gap-s8">
      <span className="text-label-m text-ink-2">{label}</span>
      <div
        className={cn(
          'flex h-[52px] items-center gap-s12 rounded-sm border px-s16',
          status.kind === 'error' ? 'border-danger bg-danger-bg' : 'border-dashed border-line bg-paper',
        )}
      >
        {status.kind === 'uploading' ? (
          <Spinner className="text-ember" />
        ) : status.kind === 'done' ? (
          <CheckCircle size={20} weight="fill" className="text-success" aria-hidden />
        ) : (
          <Paperclip size={20} className="text-ink-2" aria-hidden />
        )}
        <span className="min-w-0 flex-1 truncate text-body-m text-ink">
          {status.kind === 'idle' ? t('choose') : status.kind === 'uploading' ? t('uploading') : status.name}
        </span>
        {status.kind === 'done' && onRemove ? (
          <button
            type="button"
            aria-label={t('remove')}
            className="text-ink-2"
            onClick={() => {
              setStatus({ kind: 'idle' });
              onRemove();
            }}
          >
            <X size={18} aria-hidden />
          </button>
        ) : (
          <button type="button" className="text-label-m text-ember" disabled={status.kind === 'uploading'} onClick={() => input.current?.click()}>
            {t('choose')}
          </button>
        )}
        <input
          ref={input}
          type="file"
          hidden
          accept={accept}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handle(f);
            e.target.value = '';
          }}
        />
      </div>
      <p role="status" aria-live="polite" className="text-body-m text-danger">
        {status.kind === 'error' ? t('failed') : status.kind === 'done' ? <span className="sr-only">{t('done')}</span> : null}
      </p>
    </div>
  );
}
