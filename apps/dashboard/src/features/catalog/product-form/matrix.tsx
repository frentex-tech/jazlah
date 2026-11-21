'use client';

import { Check, Minus } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { PACKAGINGS, type Packaging, type RefItem, type Rule } from '../types';

/**
 * The cut × packaging matrix (131:35405): every listed cutting style × the API's packagings. A cell is a global rule,
 * not the product's: admins (with `setRule`) change it for every product after confirming; vendors only read it.
 * A forbidden pair the product offers is outlined red (it blocks publishing).
 */
export function Matrix({
  cuttingStyles, rules, onRules, setRule, offered, name,
}: {
  cuttingStyles: RefItem[];
  rules: Rule[];
  onRules: (rules: Rule[]) => void;
  setRule?: (rules: Rule[], cuttingStyleId: string, packaging: Packaging, incompatible: boolean) => Promise<Rule[]>;
  offered: (cut: string, k: Packaging) => boolean;
  name: (n: { ar: string; en: string } | null | undefined) => string;
}) {
  const t = useTranslations('catalog.form');
  const [asking, setAsking] = useState<{ cut: RefItem; k: Packaging; incompatible: boolean } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const incompatible = (cut: string, k: Packaging) => rules.some((r) => r.cuttingStyleId === cut && r.packaging === k);

  async function apply() {
    if (!asking || !setRule) return;
    const { cut, k } = asking;
    setAsking(null);
    setBusy(`${cut.id}|${k}`);
    try {
      onRules(await setRule(rules, cut.id, k, asking.incompatible));
    } catch {
      toast('error', t('matrix.failed'));
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <div role="table" aria-label={t('matrix.title')} className="flex flex-col gap-s8">
        <div role="row" className="flex h-11 items-center">
          <span role="columnheader" className="w-[172px] shrink-0" />
          {PACKAGINGS.map((k) => (
            <span key={k} role="columnheader" className="flex w-[150px] shrink-0 justify-center text-label-m text-ink">{t(`packaging.${k}`)}</span>
          ))}
        </div>
        {cuttingStyles.map((c, ri) => (
          <div key={c.id} role="row" className={cn('flex h-[52px] items-center rounded-sm', ri % 2 === 1 && 'bg-bg')}>
            <span role="rowheader" className="flex w-[172px] shrink-0 px-s8 text-label-m text-ink">{name(c.name)}</span>
            {PACKAGINGS.map((k) => {
              const bad = incompatible(c.id, k);
              const label = t('matrix.cell', { cut: name(c.name), packaging: t(`packaging.${k}`), state: t(bad ? 'matrix.incompatible' : 'matrix.compatible') });
              const box = cn(
                'flex size-11 items-center justify-center rounded-sm',
                bad ? 'border border-line bg-paper text-ink-2' : 'bg-ember text-paper',
                bad && offered(c.id, k) && 'border-2 border-danger',
              );
              const icon = busy === `${c.id}|${k}` ? <Spinner className="size-5" /> : bad ? <Minus size={22} aria-hidden /> : <Check size={22} aria-hidden />;
              return (
                <span key={k} role="cell" className="flex w-[150px] shrink-0 justify-center">
                  {setRule ? (
                    <button type="button" aria-label={label} aria-pressed={!bad} disabled={busy !== null} onClick={() => setAsking({ cut: c, k, incompatible: !bad })} className={box}>
                      {icon}
                    </button>
                  ) : (
                    <span role="img" aria-label={label} className={box}>{icon}</span>
                  )}
                </span>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-s24 text-body-m text-ink-2">
        <span className="flex items-center gap-s8"><span aria-hidden className="size-5 rounded-sm bg-ember" />{t('matrix.compatible')}</span>
        <span className="flex items-center gap-s8"><span aria-hidden className="size-5 rounded-sm border border-line bg-paper" />{t('matrix.legendIncompatible')}</span>
      </div>
      {asking && (
        <ConfirmDialog
          open
          wide
          onOpenChange={(o) => !o && setAsking(null)}
          title={t('matrix.confirmTitle')}
          body={t(asking.incompatible ? 'matrix.confirmForbid' : 'matrix.confirmAllow', { cut: name(asking.cut.name), packaging: t(`packaging.${asking.k}`) })}
          confirmLabel={t('matrix.confirm')}
          onConfirm={() => void apply()}
        />
      )}
    </>
  );
}
