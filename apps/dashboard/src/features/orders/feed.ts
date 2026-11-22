import { panelFetch } from '@/lib/panel-fetch';
import type { OrdersPanel } from './backend';
import type { OrderSummary, Page } from './types';

/** New orders for a board, pushed or polled: `subscribe` returns the unsubscribe. */
export type OrdersFeed = {
  /** `onPolled` (polling only) runs after each successful poll. */
  subscribe(onOrder: (o: OrderSummary) => void, onPolled?: () => void): () => void;
};

/**
 * Server-sent `order.created` from our events route (ORD-API-3's realtime, relayed by the server). The browser gives up
 * on a stream that answers non-200 on reconnect (an expired access cookie: 401), so the board then polls; the first
 * poll goes through panelFetch, which refreshes the session, and the stream is opened again.
 */
export const streamFeed = (panel: OrdersPanel, poll: (p: OrdersPanel) => OrdersFeed = pollFeed): OrdersFeed => ({
  subscribe(onOrder) {
    let stop = () => {};
    let polled = false;
    const open = () => {
      const es = new EventSource(`/api/${panel}/orders/events`);
      es.addEventListener('order.created', (e) => onOrder(JSON.parse((e as MessageEvent<string>).data) as OrderSummary));
      es.addEventListener('error', () => {
        if (es.readyState !== EventSource.CLOSED) return; // the browser is retrying by itself
        es.close();
        if (polled) return void (stop = poll(panel).subscribe(onOrder)); // reopened and refused again: keep polling
        polled = true;
        stop = poll(panel).subscribe((o) => onOrder(o), () => {
          stop();
          open();
        });
      });
      stop = () => es.close();
    };
    open();
    return () => stop();
  },
});

// shortcut: polls the first list page every 15 s while the backend cannot push (no ORD-API-3 realtime in openapi.json);
// switch to the socket.io rooms relayed through the events route once ORD-API-3 lands (#88).
export const pollFeed = (panel: OrdersPanel, everyMs = 15_000): OrdersFeed => ({
  subscribe(onOrder, onPolled) {
    let seen: Set<string> | null = null;
    const tick = async () => {
      const page = await panelFetch<Page<OrderSummary>>(panel, `/api/${panel}/orders`).catch(() => null);
      if (!page) return;
      if (seen) page.items.filter((o) => !seen!.has(o.id)).forEach(onOrder);
      seen = new Set([...(seen ?? []), ...page.items.map((o) => o.id)]);
      onPolled?.();
    };
    void tick();
    const id = setInterval(() => void tick(), everyMs);
    return () => clearInterval(id);
  },
});
