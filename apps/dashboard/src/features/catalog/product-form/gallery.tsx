'use client';

import { Plus, X } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { IMAGE_TYPES, MAX_IMAGES, PRODUCT_IMAGE_MAX } from '../types';
import type { FormState } from './values';

/**
 * Images (131:35405): the cover, the others, then «add». Drag one onto another to reorder (the first is the cover),
 * or focus it and use the arrow keys; each new file is uploaded at once (ticket, storage, confirm).
 */
export function Gallery({ images, upload, error, onChange }: { images: FormState['images']; upload: (f: File) => Promise<string>; error?: string; onChange: (v: FormState['images']) => void }) {
  const t = useTranslations('catalog.form.images');
  const tg = useTranslations();
  const input = useRef<HTMLInputElement>(null);
  const dragged = useRef<number | null>(null);
  const [pending, setPending] = useState(0);
  const [failed, setFailed] = useState<string>();
  const latest = useRef(images);
  latest.current = images;
  const blobs = useRef<string[]>([]);
  useEffect(() => () => blobs.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length || from === to) return;
    const next = [...images];
    next.splice(to, 0, next.splice(from, 1)[0]!);
    onChange(next);
  };
  async function add(files: File[]) {
    setFailed(undefined);
    const room = MAX_IMAGES - images.length - pending;
    for (const file of files.slice(0, Math.max(0, room))) {
      if (!IMAGE_TYPES.includes(file.type) || file.size > PRODUCT_IMAGE_MAX) {
        setFailed(t('rule'));
        continue;
      }
      setPending((n) => n + 1);
      try {
        const mediaId = await upload(file);
        const url = URL.createObjectURL(file);
        blobs.current.push(url);
        onChange([...latest.current, { mediaId, url }]);
      } catch {
        setFailed(tg('upload.failed'));
      } finally {
        setPending((n) => n - 1);
      }
    }
  }

  const tile = (i: number, img: FormState['images'][number]) => (
    <div
      key={img.mediaId}
      draggable
      onDragStart={() => (dragged.current = i)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => dragged.current !== null && move(dragged.current, i)}
      className={cn('group relative shrink-0 overflow-hidden bg-sand', i === 0 ? 'h-[180px] w-[240px] rounded-md' : 'h-[84px] w-[114px] rounded-sm')}
    >
      <button
        type="button"
        aria-label={t(i === 0 ? 'cover' : 'image', { n: i + 1, count: images.length })}
        onKeyDown={(e) => {
          const rtl = document.documentElement.dir === 'rtl';
          if (e.key === 'ArrowRight') move(i, rtl ? i - 1 : i + 1);
          if (e.key === 'ArrowLeft') move(i, rtl ? i + 1 : i - 1);
        }}
        className="size-full cursor-grab"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- a CDN or blob: preview, shown as is */}
        {img.url && <img src={img.url} alt="" className="size-full object-cover" />}
      </button>
      <button type="button" aria-label={t('remove', { n: i + 1 })} onClick={() => onChange(images.filter((x) => x.mediaId !== img.mediaId))} className="absolute end-s4 top-s4 flex size-7 items-center justify-center rounded-pill bg-paper/90 text-ink">
        <X size={14} aria-hidden />
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-s8">
      <div className="flex flex-wrap gap-s12">
        {images[0] && tile(0, images[0])}
        {images.length > 1 && <div className="grid grid-flow-col grid-rows-2 gap-s12">{images.slice(1).map((img, j) => tile(j + 1, img))}</div>}
        {images.length + pending < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => input.current?.click()}
            className={cn('flex h-[180px] items-center justify-center gap-s8 rounded-md border bg-bg text-label-m text-ink-2', images.length ? 'w-[240px]' : 'w-full', error || failed ? 'border-danger' : 'border-line')}
          >
            {pending ? <Spinner className="size-6 text-ember" /> : <Plus size={24} aria-hidden />}
            {pending ? tg('upload.uploading') : t('add')}
          </button>
        )}
      </div>
      {(error || failed) && <p role="alert" className="text-body-m text-danger">{error ?? failed}</p>}
      <input
        ref={input}
        type="file"
        hidden
        multiple
        accept={IMAGE_TYPES.join(',')}
        aria-label={t('add')}
        onChange={(e) => {
          void add([...(e.target.files ?? [])]);
          e.target.value = '';
        }}
      />
    </div>
  );
}
