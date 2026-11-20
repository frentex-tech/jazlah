'use client';

import { ArrowDown, ArrowUp, DotsSixVertical, DotsThree, Plus } from '@phosphor-icons/react';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PageHeader } from '@/components/shell/page-header';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { InputField } from '@/components/ui/form-field';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { StateCard } from '@/components/ui/state-card';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toast';
import { Link } from '@/i18n/navigation';
import { ApiError, panelFetch } from '@/lib/panel-fetch';
import { cn } from '@/lib/utils';
import { fieldErrors, loadAll, uploadImage } from './client';
import { CATEGORY_IMAGE_MAX, bySortOrder, IMAGE_TYPES, type RefItem } from './types';

const URL_LIST = '/api/admin/catalog/lists/categories';
// Column widths of 131:19875, start side first.
const COLS = [320, 160, 110, 90, 130] as const;
/** `image`: a new upload, `'remove'` to drop the current one, or null to keep it. */
type Editing = { item: RefItem | null; ar: string; en: string; active: boolean; image: { mediaId: string; preview: string } | 'remove' | null };

/**
 * CAT-DSH-1: «التصنيفات» (131:19875 and its states, 131:21038 the dialog). GET/POST/PATCH /v1/admin/lists/categories.
 * Reordering saves `sortOrder` with one PATCH per moved category: the API has no bulk reorder.
 */
export function Categories() {
  const t = useTranslations('catalog.categories');
  const locale = useLocale();
  const [data, setData] = useState<RefItem[] | 'loading' | 'error' | 'denied'>('loading');
  const [order, setOrder] = useState<RefItem[] | null>(null); // the draft order while reordering
  const [savingOrder, setSavingOrder] = useState(false);
  const [editing, setEditing] = useState<Editing | null>(null);

  const load = useCallback(async () => {
    setData('loading');
    try {
      setData((await loadAll<RefItem>('admin', URL_LIST)).sort(bySortOrder));
    } catch (e) {
      setData(e instanceof ApiError && e.code === 'NOT_ALLOWED' ? 'denied' : 'error');
    }
  }, []);
  useEffect(() => void load(), [load]);

  const items = Array.isArray(data) ? data : [];
  const rows = order ?? items;
  const nameOf = (x: RefItem) => (locale === 'en' ? x.name.en : x.name.ar);
  const open = (item: RefItem | null) =>
    setEditing({ item, ar: item?.name.ar ?? '', en: item?.name.en ?? '', active: item?.isActive ?? true, image: null });

  async function saveOrder() {
    if (!order) return;
    setSavingOrder(true);
    try {
      // Positions 1..n; only the categories whose position changed are sent.
      for (const [i, x] of order.entries()) {
        if (x.sortOrder !== i + 1) await panelFetch('admin', `${URL_LIST}/${x.id}`, { method: 'PATCH', body: JSON.stringify({ sortOrder: i + 1 }) });
      }
      toast('success', t('orderSaved'));
    } catch {
      toast('error', t('orderFailed'));
    } finally {
      setOrder(null); // the table then shows the order as saved, also after a partial failure
      setSavingOrder(false);
      void load();
    }
  }

  const ready = Array.isArray(data);
  const card = 'h-[360px]';
  return (
    <>
      <PageHeader
        breadcrumb={t('breadcrumb')}
        title={t('title')}
        actions={
          order ? (
            <>
              <Button onClick={() => void saveOrder()} loading={savingOrder}>{t('saveOrder')}</Button>
              <Button variant="secondary" disabled={savingOrder} onClick={() => setOrder(null)}>{t('cancelOrder')}</Button>
            </>
          ) : (
            <>
              <Button disabled={!ready} onClick={() => open(null)}>{t('add')}</Button>
              <Button variant="secondary" disabled={!ready || items.length < 2} onClick={() => setOrder(items)}>{t('reorder')}</Button>
            </>
          )
        }
      />
      {data === 'denied' ? (
        <StateCard kind="denied" className={card} title={t('denied.title')} body={t('denied.body')} action={<Link href="/admin" className={buttonVariants({ variant: 'secondary' })}>{t('denied.action')}</Link>} />
      ) : data === 'error' ? (
        <StateCard kind="error" className={card} title={t('error.title')} body={t('error.body')} action={<Button onClick={() => void load()}>{t('error.action')}</Button>} />
      ) : ready && items.length === 0 ? (
        <StateCard kind="orders" className={card} title={t('empty.title')} body={t('empty.body')} action={<Button variant="secondary" onClick={() => open(null)}>{t('add')}</Button>} />
      ) : (
        <CategoryTable rows={data === 'loading' ? null : rows} reorder={order !== null} onMove={setOrder} onEdit={open} nameOf={nameOf} />
      )}
      {editing && (
        <CategoryDialog
          editing={editing}
          onChange={setEditing}
          onClose={() => {
            setEditing(null);
            void load(); // a failed save may have added the category already
          }}
          onSaved={() => {
            setEditing(null);
            void load();
          }}
          nextOrder={Math.max(0, ...items.map((x) => x.sortOrder ?? 0)) + 1}
        />
      )}
    </>
  );
}

function CategoryTable({
  rows, reorder, onMove, onEdit, nameOf,
}: {
  rows: RefItem[] | null;
  reorder: boolean;
  onMove: (rows: RefItem[]) => void;
  onEdit: (x: RefItem) => void;
  nameOf: (x: RefItem) => string;
}) {
  const t = useTranslations('catalog.categories');
  const dragged = useRef<number | null>(null);
  const move = (from: number, to: number) => {
    if (!rows || to < 0 || to >= rows.length || from === to) return;
    const next = [...rows];
    next.splice(to, 0, next.splice(from, 1)[0]!);
    onMove(next);
  };
  const cell = 'flex shrink-0 items-center px-s8';
  const row = 'flex h-16 items-center border-b border-line px-s24';
  const heads = [t('cols.category'), t('cols.slug'), t('cols.products'), t('cols.order'), t('cols.status')];
  return (
    <div className="w-full overflow-hidden rounded-md border border-line bg-paper" aria-busy={!rows}>
      <div role="table" aria-label={t('title')}>
        <div role="row" className="flex h-12 items-center bg-sand px-s24">
          {heads.map((h, i) => (
            <div key={h} role="columnheader" className={cn(cell, 'text-label-m text-ink')} style={{ width: COLS[i] }}>{h}</div>
          ))}
          <div role="columnheader" aria-label={t('cols.actions')} className={cn(cell, 'w-[52px]')} />
        </div>
        {!rows
          ? Array.from({ length: 7 }, (_, i) => (
              <div key={i} role="row" className={row}>
                {[70, 87, 86, 66, 106].map((w, j) => (
                  <div key={j} role="cell" className={cell} style={{ width: COLS[j] }}><Skeleton style={{ width: w }} /></div>
                ))}
              </div>
            ))
          : rows.map((x, i) => (
              <div
                key={x.id}
                role="row"
                draggable={reorder}
                onDragStart={() => (dragged.current = i)}
                onDragOver={(e) => reorder && e.preventDefault()}
                onDrop={() => dragged.current !== null && move(dragged.current, i)}
                className={cn(row, 'text-body-m text-ink', reorder && 'cursor-grab bg-paper')}
              >
                <div role="cell" className={cn(cell, 'gap-s12 text-label-m')} style={{ width: COLS[0] }}>
                  {reorder && <DotsSixVertical size={20} aria-hidden className="text-ink-2" />}
                  {x.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- the API's public CDN URL, shown as is
                    <img src={x.imageUrl} alt="" className="size-11 rounded-sm object-cover" />
                  ) : (
                    <span aria-hidden className="size-11 rounded-sm bg-sand" />
                  )}
                  {nameOf(x)}
                </div>
                <div role="cell" className={cell} style={{ width: COLS[1] }} dir="ltr">{x.name.en}</div>
                {/* shortcut: no product count on a list entry, API gap: shown as a dash. */}
                <div role="cell" className={cell} style={{ width: COLS[2] }}>—</div>
                <div role="cell" className={cell} style={{ width: COLS[3] }}>{reorder ? i + 1 : x.sortOrder}</div>
                <div role="cell" className={cell} style={{ width: COLS[4] }}>
                  <Badge type={x.isActive ? 'success' : 'neutral'}>{t(x.isActive ? 'visible' : 'hidden')}</Badge>
                </div>
                <div role="cell" className={cn(cell, 'w-[52px] gap-s4')}>
                  {reorder ? (
                    // Keyboard and screen reader way to reorder, besides dragging.
                    <>
                      <button type="button" aria-label={t('moveUp', { name: nameOf(x) })} disabled={i === 0} onClick={() => move(i, i - 1)} className="text-ink-2 disabled:text-muted-soft">
                        <ArrowUp size={18} aria-hidden />
                      </button>
                      <button type="button" aria-label={t('moveDown', { name: nameOf(x) })} disabled={i === rows.length - 1} onClick={() => move(i, i + 1)} className="text-ink-2 disabled:text-muted-soft">
                        <ArrowDown size={18} aria-hidden />
                      </button>
                    </>
                  ) : (
                    <button type="button" aria-label={t('edit', { name: nameOf(x) })} onClick={() => onEdit(x)} className="flex text-ink-2">
                      <DotsThree size={22} aria-hidden />
                    </button>
                  )}
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}

function CategoryDialog({
  editing, onChange, onClose, onSaved, nextOrder,
}: {
  editing: Editing;
  onChange: (e: Editing) => void;
  onClose: () => void;
  onSaved: () => void;
  nextOrder: number;
}) {
  const t = useTranslations('catalog.categories');
  const tg = useTranslations();
  const locale = useLocale();
  const input = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<{ ar?: string; en?: string; image?: string }>({});
  const [busy, setBusy] = useState<'upload' | 'save' | null>(null);
  const { item } = editing;
  const fresh = editing.image && editing.image !== 'remove' ? editing.image : null;
  const preview = editing.image === 'remove' ? null : (fresh?.preview ?? item?.imageUrl);
  useEffect(() => () => void (fresh && URL.revokeObjectURL(fresh.preview)), [fresh]);

  async function upload(file: File) {
    if (!IMAGE_TYPES.includes(file.type) || file.size > CATEGORY_IMAGE_MAX) return setErrors({ ...errors, image: t('imageRule') });
    setBusy('upload');
    try {
      const mediaId = await uploadImage('admin', 'catalog.category-image', file);
      onChange({ ...editing, image: { mediaId, preview: URL.createObjectURL(file) } });
      setErrors({ ...errors, image: undefined });
    } catch {
      setErrors({ ...errors, image: tg('upload.failed') });
    } finally {
      setBusy(null);
    }
  }

  async function save() {
    const ar = editing.ar.trim();
    const en = editing.en.trim();
    const e = { ar: ar.length < 2 ? tg('form.tooShort') : undefined, en: en.length < 2 ? tg('form.tooShort') : undefined };
    setErrors(e);
    if (e.ar || e.en) return;
    setBusy('save');
    try {
      const name = { ar, en };
      if (!item) {
        const created = await panelFetch<RefItem>('admin', URL_LIST, {
          method: 'POST',
          body: JSON.stringify({ name, sortOrder: nextOrder, ...(fresh && { imageMediaId: fresh.mediaId }) }),
        });
        // A new entry starts active: hiding it is a second call. From here the dialog edits the created entry, so a
        // retry after a failed second call PATCHes it instead of adding it again.
        onChange({ ...editing, item: created, image: null });
        if (!editing.active) await panelFetch('admin', `${URL_LIST}/${created.id}`, { method: 'PATCH', body: JSON.stringify({ isActive: false }) });
      } else {
        const body = {
          ...((ar !== item.name.ar || en !== item.name.en) && { name }),
          ...(editing.active !== item.isActive && { isActive: editing.active }),
          ...(fresh && { imageMediaId: fresh.mediaId }),
          ...(editing.image === 'remove' && item.imageUrl && { imageMediaId: null }),
        };
        if (Object.keys(body).length) await panelFetch('admin', `${URL_LIST}/${item.id}`, { method: 'PATCH', body: JSON.stringify(body) });
      }
      toast('success', t('saved', { name: ar }));
      onSaved();
    } catch (err) {
      const f = fieldErrors(err);
      if (f && (f['name.ar'] || f['name.en'])) return setErrors({ ar: f['name.ar'] && tg('form.invalid'), en: f['name.en'] && tg('form.invalid') });
      if (err instanceof ApiError && (err.code === 'MEDIA_NOT_FOUND' || err.code === 'MEDIA_NOT_READY')) return setErrors({ image: tg('upload.failed') });
      toast('error', t('saveFailed'));
    } finally {
      setBusy(null);
    }
  }

  return (
    <ConfirmDialog
      wide
      open
      onOpenChange={(o) => !o && onClose()}
      title={item ? t('editTitle', { name: locale === 'en' ? item.name.en : item.name.ar }) : t('addTitle')}
      confirmLabel={tg('form.save')}
      loading={busy === 'save'}
      onConfirm={() => void save()}
    >
      <div className="flex flex-col gap-s8">
        <button
          type="button"
          aria-label={t('image')}
          onClick={() => input.current?.click()}
          className={cn('relative flex h-[140px] w-full items-center justify-center overflow-hidden rounded-md border bg-bg text-ink-2', errors.image ? 'border-danger' : 'border-line')}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- a CDN or blob: preview, shown as is
            <img src={preview} alt="" className="size-full object-cover" />
          ) : (
            <span className="flex items-center gap-s8 text-label-m"><Plus size={24} aria-hidden />{t('image')}</span>
          )}
          {busy === 'upload' && (
            <span className="absolute inset-0 flex items-center justify-center bg-paper/70 text-ember"><Spinner className="size-6" /></span>
          )}
        </button>
        {preview && (
          <button type="button" onClick={() => onChange({ ...editing, image: 'remove' })} className="self-start text-label-m text-ember">
            {t('removeImage')}
          </button>
        )}
        {errors.image && <p role="alert" className="text-body-m text-danger">{errors.image}</p>}
        <input
          ref={input}
          type="file"
          hidden
          accept={IMAGE_TYPES.join(',')}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
            e.target.value = '';
          }}
        />
      </div>
      <div className="grid grid-cols-2 gap-s24">
        <InputField label={t('nameAr')} hint={t('nameArHint')} value={editing.ar} maxLength={100} error={errors.ar} onChange={(e) => onChange({ ...editing, ar: e.target.value })} />
        <InputField label={t('nameEn')} hint={t('nameEnHint')} value={editing.en} maxLength={100} dir="ltr" error={errors.en} onChange={(e) => onChange({ ...editing, en: e.target.value })} />
      </div>
      <Switch label={t('visibleSwitch')} checked={editing.active} onChange={(active) => onChange({ ...editing, active })} />
    </ConfirmDialog>
  );
}
