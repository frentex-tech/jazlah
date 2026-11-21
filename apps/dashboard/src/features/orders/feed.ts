import { panelFetch } from '@/lib/panel-fetch';
import type { OrdersPanel } from './backend';
import type { OrderSummary, Page } from './types';

/** New orders for a board, pushed or polled: `subscribe` returns the unsubscribe. */
export type OrdersFeed = { subscribe(onOrder: (o: OrderSummary) => void): () => void };

/** Server-sent `order.created` from our events route (ORD-API-3's realtime, relayed by the server). */
export const streamFeed = (panel: OrdersPanel): OrdersFeed => ({
  subscribe(onOrder) {
    const es = new EventSource(`/api/${panel}/orders/events`);
    es.addEventListener('order.created', (e) => onOrder(JSON.parse((e as MessageEvent<string>).data) as OrderSummary));
    return () => es.close();
  },
});

// shortcut: polls the first list page every 15 s while the backend cannot push (no ORD-API-3 realtime in openapi.json);
// switch to the socket.io rooms relayed through the events route once ORD-API-3 lands (#88).
export const pollFeed = (panel: OrdersPanel, everyMs = 15_000): OrdersFeed => ({
  subscribe(onOrder) {
    let seen: Set<string> | null = null;
    const tick = async () => {
      const page = await panelFetch<Page<OrderSummary>>(panel, `/api/${panel}/orders`).catch(() => null);
      if (!page) return;
      if (seen) page.items.filter((o) => !seen!.has(o.id)).forEach(onOrder);
      seen = new Set([...(seen ?? []), ...page.items.map((o) => o.id)]);
    };
    void tick();
    const id = setInterval(() => void tick(), everyMs);
    return () => clearInterval(id);
  },
});
