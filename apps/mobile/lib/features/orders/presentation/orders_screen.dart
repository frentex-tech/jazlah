import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:jazlah/app/router/router.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/auth/presentation/session_controller.dart';
import 'package:jazlah/features/cart/presentation/cart_screen.dart';
import 'package:jazlah/features/catalog/presentation/catalog_widgets.dart';
import 'package:jazlah/features/checkout/domain/order.dart';
import 'package:jazlah/features/orders/data/orders_repository.dart';
import 'package:jazlah/features/orders/presentation/order_widgets.dart';
import 'package:jazlah/features/orders/presentation/orders_providers.dart';
import 'package:jazlah/l10n/app_localizations.dart';

/// «طلباتي», the orders tab (Figma 135-63663 list, 135-63749 loading, 135-63826 empty, 135-63940 error,
/// 135-64028 not signed in). «الكل» shows both scopes, «الجارية» current, «المكتملة» past.
class OrdersScreen extends ConsumerStatefulWidget {
  const OrdersScreen({super.key});

  @override
  ConsumerState<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends ConsumerState<OrdersScreen> {
  OrderScope? _scope;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final session = ref.watch(sessionProvider);
    // Still reading the stored session: the loading list, not the sign-in panel.
    final signedIn = session == SessionStatus.signedIn || session == SessionStatus.unknown;

    final Widget body;
    if (!signedIn) {
      body = Center(
        child: JEmptyState(
          kind: JEmptyStateKind.denied,
          title: l10n.ordersSignInTitle,
          body: l10n.ordersSignInBody,
          actionLabel: l10n.signIn,
          onAction: () => context.push('${Routes.phone}?from=${Uri.encodeComponent(Routes.orders)}'),
        ),
      );
    } else {
      final orders = session == SessionStatus.unknown
          ? const AsyncLoading<List<Order>>()
          : ref.watch(ordersProvider(_scope));
      Widget chip(OrderScope? scope, String label) => JChip(
        label: label,
        selected: _scope == scope,
        onTap: () => setState(() => _scope = scope),
      );
      final list = switch (orders) {
        AsyncValue(:final error?) when !orders.hasValue => Center(
          child: CatalogErrorPanel(
            error: error,
            title: l10n.ordersErrorTitle,
            body: l10n.ordersErrorBody,
            onRetry: () => ref.invalidate(ordersProvider(_scope)),
          ),
        ),
        AsyncValue(hasValue: false) => ListView(
          padding: const EdgeInsets.symmetric(horizontal: JSpace.s16),
          children: [
            for (var i = 0; i < 3; i++) ...[
              const JSkeletonRow(), // draws its own card
              const SizedBox(height: JSpace.s12),
            ],
          ],
        ),
        AsyncValue(value: final items?) when items.isEmpty => Center(
          child: JEmptyState(
            kind: JEmptyStateKind.orders,
            title: l10n.ordersEmptyTitle,
            body: l10n.ordersEmptyBody,
            actionLabel: l10n.ordersEmptyAction,
            onAction: () => context.go(Routes.home),
          ),
        ),
        _ => RefreshIndicator(
          onRefresh: () => ref.refresh(ordersProvider(_scope).future),
          child: ListView.separated(
            padding: const EdgeInsets.fromLTRB(JSpace.s16, 0, JSpace.s16, JSpace.s16),
            itemCount: orders.value!.length,
            separatorBuilder: (_, _) => const SizedBox(height: JSpace.s12),
            itemBuilder: (_, i) => _OrderCard(order: orders.value![i]),
          ),
        ),
      };
      body = Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Only the list draws the tabs (135-63663); loading, error and empty don't, except that an empty
          // «الجارية» or «المكتملة» keeps them so the customer can switch back.
          if (orders.value case final items? when items.isNotEmpty || _scope != null)
            Padding(
              padding: const EdgeInsets.fromLTRB(JSpace.s16, JSpace.s16, JSpace.s16, JSpace.s12),
              // Wraps on a narrow screen or a long translation.
              child: Wrap(
                spacing: JSpace.s8,
                runSpacing: JSpace.s8,
                children: [
                  chip(null, l10n.ordersAll),
                  chip(OrderScope.current, l10n.ordersCurrent),
                  chip(OrderScope.past, l10n.ordersPast),
                ],
              ),
            ),
          Expanded(child: list),
        ],
      );
    }

    return SafeArea(
      bottom: false,
      child: Column(
        children: [
          JAppHeader.page(title: l10n.menuOrders, cartLabel: l10n.cart, onBack: () => context.go(Routes.home)),
          Expanded(child: body),
        ],
      ),
    );
  }
}

class _OrderCard extends ConsumerWidget {
  const _OrderCard({required this.order});

  final Order order;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final now = ref.watch(ordersClockProvider)();
    return Semantics(
      button: true,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => unawaited(context.push(Routes.order(order.id))),
        child: CartCard(
          gap: 0,
          padding: JSpace.s16,
          children: [
            Row(
              children: [
                Expanded(child: Text(l10n.ordersNumber(order.number), style: JText.h3)),
                orderStatusBadge(l10n, order.status),
              ],
            ),
            const SizedBox(height: JSpace.s12),
            Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: SizedBox(width: 56, height: 56, child: CatalogImage(order.items.firstOrNull?.image)),
                ),
                const SizedBox(width: JSpace.s12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(order.vendorName.of(context.lang), style: JText.labelM),
                      const SizedBox(height: 2),
                      if (order.items.isNotEmpty)
                        Text(orderItemsText(context, order), style: JText.bodyM.copyWith(color: JColors.ink2)),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: JSpace.s12),
            Row(
              children: [
                Expanded(
                  child: Text(l10n.productPrice(formatHalalas(order.total)), style: JText.labelM),
                ),
                Text(orderWhen(context, order, now), style: JText.bodyM.copyWith(color: JColors.ink2)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
