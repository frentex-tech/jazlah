import {
  Bank, Camera, ChartLineUp, CookingPot, Gear, ListChecks, Package, PawPrint, Receipt, Star, Storefront, Truck, Users, Wallet,
} from '@phosphor-icons/react/dist/ssr';
import type { Icon, IconWeight } from '@phosphor-icons/react';
import type { Panel } from '@/lib/session';

export type NavItem = {
  key: string;
  href: string;
  icon: Icon;
  /** Weight when not active; active items use `activeWeight` (default fill), as in Figma «Nav item» (16:1140). */
  weight?: IconWeight;
  activeWeight?: IconWeight;
};

// Items, order and icons from the shells: admin 135:46622, vendor 135:39184, kitchen 131:79506.
export const NAV: Record<Panel, NavItem[]> = {
  admin: [
    { key: 'overview', href: '/admin', icon: ChartLineUp, activeWeight: 'regular' },
    { key: 'orders', href: '/admin/orders', icon: Receipt, weight: 'fill' },
    { key: 'stores', href: '/admin/vendors', icon: Storefront },
    { key: 'products', href: '/admin/catalog', icon: Package },
    { key: 'customers', href: '/admin/customers', icon: Users },
    { key: 'delivery', href: '/admin/delivery', icon: Truck },
    { key: 'cooking', href: '/admin/kitchens', icon: Package },
    { key: 'finance', href: '/admin/finance', icon: Bank },
    { key: 'stories', href: '/admin/stories', icon: Camera },
    { key: 'loyalty', href: '/admin/loyalty', icon: Star, weight: 'fill' },
    { key: 'charity', href: '/admin/charity', icon: PawPrint },
    { key: 'settings', href: '/admin/settings', icon: Gear },
  ],
  vendor: [
    { key: 'orders', href: '/vendor/orders', icon: ListChecks },
    { key: 'products', href: '/vendor/products', icon: Package, weight: 'fill' },
    { key: 'earnings', href: '/vendor/earnings', icon: Wallet },
    { key: 'store', href: '/vendor/store', icon: Storefront },
    { key: 'visits', href: '/vendor/visits', icon: PawPrint },
    { key: 'settings', href: '/vendor/settings', icon: Gear },
  ],
  kitchen: [{ key: 'orders', href: '/kitchen', icon: CookingPot }],
};

/** The item whose href is the longest prefix of the path. The panel root ("/admin") is active on itself only. */
export function activeKey(panel: Panel, pathname: string): string | undefined {
  return NAV[panel]
    .filter((i) => pathname === i.href || (i.href !== `/${panel}` && pathname.startsWith(`${i.href}/`)))
    .sort((a, b) => b.href.length - a.href.length)[0]?.key;
}
