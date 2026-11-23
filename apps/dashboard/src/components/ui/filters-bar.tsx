'use client';

import { MagnifyingGlass, X } from '@phosphor-icons/react';
import { Button } from './button';

// Figma DS «Filters bar» (16:1645): search, filters, «clear all»; applied filters as chips (state=active).
export function FiltersBar({
  search,
  onSearch,
  searchLabel,
  clearLabel,
  children,
  applied = [],
}: {
  search: string;
  onSearch: (v: string) => void;
  searchLabel: string;
  clearLabel: string;
  children?: React.ReactNode;
  applied?: { key: string; label: string; onRemove: () => void }[];
}) {
  const active = applied.length > 0 || search !== '';
  return (
    <div className="flex w-full flex-col gap-s12 rounded-md border border-line bg-paper p-s16">
      <div className="flex flex-wrap items-center gap-s12">
        <label className="flex h-11 w-[200px] items-center gap-s8 rounded-sm border border-line bg-bg px-s12">
          <MagnifyingGlass size={18} className="shrink-0 text-ink-2" aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={searchLabel}
            aria-label={searchLabel}
            className="min-w-0 flex-1 bg-transparent text-body-m text-ink outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:appearance-none"
          />
          {/* The DS «x» instead of the browser's own search clear button. */}
          {search !== '' && (
            <button type="button" onClick={() => onSearch('')} aria-label={`${clearLabel}: ${searchLabel}`} className="shrink-0 text-ink-2">
              <X size={16} aria-hidden />
            </button>
          )}
        </label>
        {children}
        <span className="flex-1" />
        <Button
          variant="ghost"
          size="S"
          disabled={!active}
          onClick={() => {
            onSearch('');
            applied.forEach((a) => a.onRemove());
          }}
        >
          {clearLabel}
        </Button>
      </div>
      {applied.length > 0 && (
        <div className="flex flex-wrap items-center gap-s8">
          {applied.map((a) => (
            <span key={a.key} className="flex h-8 items-center gap-[6px] rounded-pill bg-sand px-s12 text-label-m text-ink">
              {a.label}
              <button type="button" onClick={a.onRemove} aria-label={`${clearLabel}: ${a.label}`} className="text-ink-2">
                <X size={14} aria-hidden />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
