import type { NextRequest } from 'next/server';
import { vendorCatalogBackend } from '@/features/catalog/vendor-backend';
import type { NamedRef, RefItem, Rule } from '@/features/catalog/types';
import { withPanelSession } from '@/lib/auth/panel-session';
import { langOf } from '@/lib/route';

const asItem = (x: NamedRef): RefItem => ({ ...x, isActive: true, sortOrder: null, imageUrl: null, createdAt: '' });

// The product form's options in one answer (FormOptions): categories, the three vendor lists and the global rules.
export function GET(req: NextRequest) {
  const lang = langOf(req);
  return withPanelSession(req, 'vendor', async (token) => {
    const b = vendorCatalogBackend();
    const [categories, meatTypes, cuttingStyles, exclusionItems, rules] = await Promise.all([
      b.categories(lang), b.list(token, lang, 'meat-types'), b.list(token, lang, 'cutting-styles'), b.list(token, lang, 'exclusion-items'), b.rules(token, lang),
    ]);
    if (!meatTypes.ok) return meatTypes;
    if (!cuttingStyles.ok) return cuttingStyles;
    if (!exclusionItems.ok) return exclusionItems;
    if (!rules.ok) return rules;
    if (!categories.ok) return categories;
    // The vendor rules carry no id: the read-only matrix only needs the pair.
    const pairs: Rule[] = rules.data.items.map((r, i) => ({ id: String(i), cuttingStyleId: r.cuttingStyle.id, packaging: r.packaging, createdAt: '' }));
    return {
      ok: true,
      data: {
        categories: categories.data.items, meatTypes: meatTypes.data.items.map(asItem), cuttingStyles: cuttingStyles.data.items.map(asItem),
        exclusionItems: exclusionItems.data.items.map(asItem), rules: pairs,
      },
    };
  });
}
