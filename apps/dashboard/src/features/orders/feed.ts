import { panelFetch } from '@/lib/panel-fetch';
import type { OrdersPanel } from './backend';
import type { OrderStatus, OrderSummary, Page } from './types';

/** New orders for a board, pushed or polled: `subscribe` returns the unsubscribe. */
export type OrdersFeed = {
  /**
   * `onPolled` (polling only) runs after each successful poll. `onChanged` (polling only): a listed order's status changed
   * elsewhere (customer cancel, expiry, payment capture).
   */
  subscribe(onOrder: (o: OrderSummary) => void, onPolled?: () => void, onChanged?: (o: OrderSummary) => void): () => void;
};

/**
 * Server-sent `order.created` from our events route (ORD-API-3's realtime, relayed by the server). The browser gives up
 * on a stream that answers non-200 on reconnect (an expired access cookie: 401), so the board then polls; the first
 * poll goes through panelFetch, which refreshes the session, and the stream is opened again.
 */
export const streamFeed = (panel: OrdersPanel, poll: (p: OrdersPanel) => OrdersFeed = pollFeed): OrdersFeed => ({
  // shortcut: the stream relays `order.created` only, so a status changed elsewhere shows after a reload; relay ORD-API-3's
  // `order.updated` too once it lands (#88).
  subscribe(onOrder, _onPolled, onChanged) {
    let stop = () => {};
    let polled = false;
    const open = () => {
      const es = new EventSource(`/api/${panel}/orders/events`);
      es.addEventListener('order.created', (e) => onOrder(JSON.parse((e as MessageEvent<string>).data) as OrderSummary));
      es.addEventListener('error', () => {
        if (es.readyState !== EventSource.CLOSED) return; // the browser is retrying by itself
        es.close();
        if (polled) return void (stop = poll(panel).subscribe(onOrder, undefined, onChanged)); // reopened and refused again: keep polling
        polled = true;
        stop = poll(panel).subscribe(
          (o) => onOrder(o),
          () => {
            stop();
            open();
          },
          onChanged,
        );
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
  subscribe(onOrder, onPolled, onChanged) {
    let seen: Map<string, OrderStatus> | null = null;
    const tick = async () => {
      const page = await panelFetch<Page<OrderSummary>>(panel, `/api/${panel}/orders`).catch(() => null);
      if (!page) return;
      for (const o of seen ? page.items : []) {
        const was = seen!.get(o.id);
        if (was === undefined) onOrder(o);
        else if (was !== o.status) onChanged?.(o);
      }
      seen = new Map([...(seen ?? []), ...page.items.map((o) => [o.id, o.status] as const)]);
      onPolled?.();
    };
    void tick();
    const id = setInterval(() => void tick(), everyMs);
    return () => clearInterval(id);
  },
});
