import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:jazlah/app/router/router.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/catalog/domain/catalog.dart';
import 'package:jazlah/features/catalog/presentation/catalog_providers.dart';
import 'package:jazlah/features/catalog/presentation/catalog_widgets.dart';
import 'package:jazlah/l10n/app_localizations.dart';

/// A store (Figma 118-8184; scrolled 118-8326, loading 118-8612, empty 118-8653, closed 118-8468,
/// error 118-8705): cover, logo, rating, hours and delivery badges, minimum order, category chips and
/// its products, paged. Tapping the store's name opens the info sheet (hours, city, pickup).
class StoreScreen extends ConsumerStatefulWidget {
  const StoreScreen({required this.id, super.key, this.name});

  final String id;

  /// Known by the caller: titles the page while it loads.
  final String? name;

  @override
  ConsumerState<StoreScreen> createState() => _StoreScreenState();
}

class _StoreScreenState extends ConsumerState<StoreScreen> {
  String? _categoryId;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final store = ref.watch(storeProvider(widget.id));
    final title = store.value?.name.of(context.lang) ?? widget.name ?? '';
    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            JAppHeader.page(
              title: title,
              cartLabel: l10n.cart,
              onCart: () => openCart(context),
              onBack: () => popOrHome(context),
            ),
            Expanded(
              child: store.when(
                loading: () => ListView(
                  padding: const EdgeInsets.all(JSpace.s16),
                  children: [
                    Container(
                      height: 140,
                      decoration: BoxDecoration(color: JColors.sand, borderRadius: BorderRadius.circular(JRadius.lg)),
                    ),
                    const SizedBox(height: JSpace.s12),
                    const JSkeletonRow(),
                    const SizedBox(height: JSpace.s12),
                    const Padding(
                      padding: EdgeInsetsDirectional.only(end: JSpace.s16),
                      child: ProductSkeletonRow(),
                    ),
                  ],
                ),
                error: (e, _) => ListView(
                  padding: const EdgeInsets.all(JSpace.s16),
                  children: [
                    CatalogErrorPanel(
                      error: e,
                      title: l10n.storeErrorTitle,
                      body: l10n.storeErrorBody,
                      onRetry: () => ref.invalidate(storeProvider(widget.id)),
                    ),
                  ],
                ),
                data: _content,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _content(Store s) {
    final l10n = AppLocalizations.of(context);
    final all = (categoryId: null, vendorId: s.id, sort: ProductSort.popular);
    final query = (categoryId: _categoryId, vendorId: s.id, sort: ProductSort.popular);
    // The "all" list stays watched while a chip is selected: it names the store's categories.
    final allItems = ref.watch(productPagesProvider(all)).value?.items;
    // shortcut: the chips list the categories of the products loaded so far (no per-store category
    // list, API gap for CAT-API-5 #50); a store with more than one page may miss a category until it scrolls.
    final sold = {...?allItems?.map((p) => p.categoryId)};
    final categories = [...?ref.watch(categoriesProvider).value?.where((c) => sold.contains(c.id))];
    final noProducts = _categoryId == null && (allItems?.isEmpty ?? false);
    final closedText = s.opensAt == null
        ? l10n.storeClosedNotice
        : s.opensTomorrow
        ? l10n.storeClosedOpensTomorrow(formatMinutes(l10n, s.opensAt!))
        : l10n.storeClosedOpensAt(formatMinutes(l10n, s.opensAt!));
    final header = <Widget>[
      SizedBox(
        height: 140,
        child: ClipRRect(borderRadius: BorderRadius.circular(JRadius.lg), child: CatalogImage(s.coverUrl)),
      ),
      _VendorRow(s),
      if ((s.isOpen ?? false) && s.closesAt != null || s.closed || s.deliveryMinutes != null || (s.pickup ?? false))
        Wrap(
          spacing: JSpace.s8,
          runSpacing: JSpace.s8,
          children: [
            if ((s.isOpen ?? false) && s.closesAt != null)
              JBadge(
                label: l10n.storeOpenUntil(formatMinutes(l10n, s.closesAt!)),
                type: JBadgeType.success,
                size: JBadgeSize.s,
              ),
            if (s.closed) JBadge(label: l10n.storeClosedNow, type: JBadgeType.danger, size: JBadgeSize.s),
            if (s.deliveryMinutes != null)
              JBadge(label: l10n.storeDeliveryIn(s.deliveryMinutes!), type: JBadgeType.info, size: JBadgeSize.s),
          ],
        ),
      if (s.minOrderHalalas != null)
        Row(
          children: [
            const Icon(JIcons.package, size: 20, color: JColors.ink2),
            const SizedBox(width: JSpace.s8),
            Flexible(
              child: Text(
                l10n.storeMinOrder(formatHalalas(s.minOrderHalalas!)),
                style: JText.bodyM.copyWith(color: JColors.ink2),
              ),
            ),
          ],
        ),
      if (s.closed) CatalogNotice(closedText),
      if (!noProducts && categories.isNotEmpty)
        SizedBox(
          height: 40,
          child: ListView(
            scrollDirection: Axis.horizontal,
            children: [
              JChip(label: l10n.seeAll, selected: _categoryId == null, onTap: () => setState(() => _categoryId = null)),
              for (final c in categories) ...[
                const SizedBox(width: JSpace.s8),
                JChip(
                  label: c.name.of(context.lang),
                  selected: _categoryId == c.id,
                  onTap: () => setState(() => _categoryId = c.id),
                ),
              ],
            ],
          ),
        ),
    ];
    return LoadMoreListener(
      onEnd: () => ref.read(productPagesProvider(query).notifier).loadMore(),
      child: RefreshIndicator(
        color: JColors.ember,
        onRefresh: () => quietly(
          Future.wait([
            ref.refresh(storeProvider(s.id).future),
            ref.refresh(productPagesProvider(query).future),
            // The "all" list names the chips: refresh it too when a chip is selected.
            if (_categoryId != null) ref.refresh(productPagesProvider(all).future),
          ]),
        ),
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(JSpace.s16, JSpace.s16, JSpace.s16, JSpace.s12),
              sliver: SliverList.separated(
                itemCount: header.length,
                separatorBuilder: (_, _) => const SizedBox(height: JSpace.s12),
                itemBuilder: (_, i) => header[i],
              ),
            ),
            ...productSlivers(
              context,
              ref,
              query,
              storeClosed: s.closed,
              empty: JEmptyState(
                kind: JEmptyStateKind.cart,
                title: l10n.storeEmptyTitle,
                body: l10n.storeEmptyBody,
                actionLabel: l10n.storeBrowseStores,
                onAction: () => context.pushReplacement(Routes.stores),
              ),
            ),
            SliverToBoxAdapter(child: SizedBox(height: MediaQuery.paddingOf(context).bottom)),
          ],
        ),
      ),
    );
  }
}

/// Logo, name and rating; opens the info sheet.
class _VendorRow extends StatelessWidget {
  const _VendorRow(this.store);

  final Store store;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final s = store;
    return Semantics(
      button: true,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => _showInfo(context, s),
        child: Row(
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: JColors.goldLight, width: 2),
              ),
              child: ClipOval(child: StoreLogo(s, letter: true)),
            ),
            const SizedBox(width: JSpace.s12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(s.name.of(context.lang), maxLines: 1, overflow: TextOverflow.ellipsis, style: JText.h1),
                  if (s.rating != null) ...[
                    const SizedBox(height: JSpace.s4),
                    Row(
                      children: [
                        const Icon(JIcons.starFill, size: 16, color: JColors.goldText),
                        const SizedBox(width: JSpace.s4),
                        Text(
                          l10n.storeRating(s.rating!.toStringAsFixed(1), s.ratingCount ?? 0),
                          style: JText.bodyM.copyWith(color: JColors.ink2),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Store info sheet (no Figma screen): description, hours, city and pickup, from the rows the store has.
void _showInfo(BuildContext context, Store s) {
  final l10n = AppLocalizations.of(context);
  final lang = context.lang;
  Widget row(IconData icon, String label, String value) => Padding(
    padding: const EdgeInsets.symmetric(vertical: JSpace.s8),
    child: Row(
      children: [
        Icon(icon, size: 20, color: JColors.ink2),
        const SizedBox(width: JSpace.s12),
        Expanded(
          child: Text(label, style: JText.bodyM.copyWith(color: JColors.ink2)),
        ),
        Text(value, style: JText.labelM),
      ],
    ),
  );
  unawaited(
    showJBottomSheet<void>(
      context,
      title: l10n.storeInfo,
      builder: (_) => Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: [
          if (s.description != null) ...[
            Text(s.description!.of(lang), style: JText.bodyM.copyWith(color: JColors.ink2)),
            const SizedBox(height: JSpace.s8),
          ],
          if (s.opensAt != null && s.closesAt != null)
            row(
              JIcons.clock,
              l10n.storeHours,
              l10n.storeHoursValue(formatMinutes(l10n, s.opensAt!), formatMinutes(l10n, s.closesAt!)),
            ),
          if (s.city != null) row(JIcons.mapPin, l10n.storeLocation, s.city!),
          if (s.pickup != null)
            row(JIcons.storefront, l10n.storePickup, s.pickup! ? l10n.storePickupYes : l10n.storePickupNo),
        ],
      ),
    ),
  );
}
