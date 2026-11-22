import type { BadgeType } from '@/components/ui/badge';
import { dayOf } from '@/lib/date';
import type { Name, OrderStatus } from './types';

/** Badge colour per status, as the rows of 135:47501 (preparing warning, out for delivery info, delivered success, cancelled danger, new brand). */
export const BADGE: Record<OrderStatus, BadgeType> = {
  pending_payment: 'neutral', new: 'warning', confirmed: 'brand', preparing: 'warning', ready: 'info', picked_up: 'info', out_for_delivery: 'info',
  delivered: 'success', collected: 'success', cancelled: 'danger', delivery_failed: 'danger', returned: 'neutral',
};

export const nameOf = (n: Name, locale: string) => (locale === 'en' ? n.en : n.ar);
/** A Riyadh business day (`YYYY-MM-DD`) as the frames write dates: «11 نوفمبر 2026». */
export const dateOf = (day: string, locale: string) => dayOf(`${day}T12:00:00Z`, locale);
/** A window time «16:00» as 135:49465 writes it: «4:00 م» / «4:00 PM». */
export function hm(time: string, locale: string) {
  const [h = 0, m = 0] = time.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${locale === 'en' ? (h < 12 ? 'AM' : 'PM') : h < 12 ? 'ص' : 'م'}`;
}
