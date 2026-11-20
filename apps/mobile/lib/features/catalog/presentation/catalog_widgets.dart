import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:jazlah/app/router/router.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/catalog/domain/catalog.dart';
import 'package:jazlah/features/catalog/presentation/catalog_providers.dart';
import 'package:jazlah/l10n/app_localizations.dart';

extension CatalogContext on BuildContext {
  /// The language catalog names are shown in.
  String get lang => Localizations.localeOf(this).languageCode;
}

/// `8900` → `89.00` (prices include VAT).
String formatHalalas(int halalas) {
  final h = halalas.abs();
  return '${halalas < 0 ? '-' : ''}${h ~/ 100}.${(h % 100).toString().padLeft(2, '0')}';
}

/// `23 * 60` → `11:00 م` / `11:00 PM`.
String formatMinutes(AppLocalizations l10n, int minutes) {
  final h = minutes ~/ 60 % 24;
  final m = (minutes % 60).toString().padLeft(2, '0');
  return '${h % 12 == 0 ? 12 : h % 12}:$m ${h < 12 ? l10n.timeAm : l10n.timePm}';
}

/// A catalog photo: an https URL from the API, or a bundled asset path from the mock.
/// Missing or failing photos leave the sand placeholder.
class CatalogImage extends StatelessWidget {
  const CatalogImage(this.url, {super.key});

  final String? url;

  @override
  Widget build(BuildContext context) {
    const placeholder = ColoredBox(color: JColors.sand, child: SizedBox.expand());
    final u = url;
    if (u == null || u.isEmpty) return placeholder;
    Widget error(BuildContext _, Object _, StackTrace? _) => placeholder;
    return u.startsWith('assets/')
        ? Image.asset(u, fit: BoxFit.cover, excludeFromSemantics: true, errorBuilder: error)
        : Image.network(u, fit: BoxFit.cover, excludeFromSemantics: true, errorBuilder: error);
  }
}

/// The store's logo, or its first letter on a coloured disc (Figma) when it has none.
class StoreLogo extends StatelessWidget {
  const StoreLogo(this.store, {super.key, this.letter = false});

  final Store store;

  /// Draw the first letter (store page); the home cards show the plain disc.
  final bool letter;

  static const List<Color> _colors = [JColors.brand, JColors.ink, JColors.successText];

  @override
  Widget build(BuildContext context) {
    if (store.logoUrl != null) return CatalogImage(store.logoUrl);
    // Figma: the last word's first letter without the article («مجازر الفلاح» → «ف»).
    final word = store.name.of(context.lang).trim().split(' ').last;
    final name = word.startsWith('ال') && word.length > 2 ? word.substring(2) : word;
    return ColoredBox(
      color: _colors[store.id.codeUnits.fold(0, (a, b) => a + b) % _colors.length],
      child: Center(
        child: letter && name.isNotEmpty
            ? Text(name.characters.first, style: JText.raw(31, FontWeight.w700, color: JColors.goldLight))
            : null,
      ),
    );
  }
}

/// A product in a grid: vendor, size line, fresh/unavailable badge, from-price. Tapping the card or
/// its add button opens the product (a size must be chosen there).
class ProductTile extends StatelessWidget {
  const ProductTile(this.product, {super.key, this.storeClosed = false});

  final ProductCard product;

  /// The store is closed: browse only, as unavailable.
  final bool storeClosed;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final p = product;
    final available = p.isAvailable && !storeClosed;
    void open() => context.push(Routes.product(p.id));
    return JProductCard(
      image: CatalogImage(p.coverUrl),
      vendor: p.vendorName?.of(context.lang) ?? '',
      title: p.name.of(context.lang),
      subtitle: p.subtitle?.of(context.lang),
      badge: !available
          ? JBadge(label: l10n.unavailableNow, type: JBadgeType.warning, size: JBadgeSize.s)
          : p.freshToday
          ? JBadge(label: l10n.freshToday, type: JBadgeType.brand, size: JBadgeSize.s)
          : null,
      price: p.minPriceHalalas == null ? '' : formatHalalas(p.minPriceHalalas!),
      currency: l10n.currency,
      addLabel: l10n.addToCart,
      available: available,
      onTap: open,
      onAdd: open,
    );
  }
}

/// A partner store; opens its page.
class StoreCardTile extends StatelessWidget {
  const StoreCardTile(this.store, {super.key});

  final Store store;

  @override
  Widget build(BuildContext context) {
    final name = store.name.of(context.lang);
    return JStoreCard(
      logo: StoreLogo(store),
      name: name,
      rating: store.rating?.toStringAsFixed(1),
      onTap: () => context.push(Routes.store(store.id), extra: name),
    );
  }
}

/// Figma's product grid: two 165-wide cards from the start edge, 12 apart.
abstract final class ProductGrid {
  static const padding = EdgeInsetsDirectional.only(start: JSpace.s16, end: 32);
  static const delegate = SliverGridDelegateWithFixedCrossAxisCount(
    crossAxisCount: 2,
    mainAxisSpacing: JSpace.s12,
    crossAxisSpacing: JSpace.s12,
    mainAxisExtent: 289,
  );
}

class _Bar extends StatelessWidget {
  const _Bar(this.width);

  final double width;

  @override
  Widget build(BuildContext context) => Container(
    width: width,
    height: 12,
    decoration: BoxDecoration(color: JColors.sand, borderRadius: BorderRadius.circular(JRadius.pill)),
  );
}

/// Loading placeholder of a product card (198 high).
class ProductSkeletonCard extends StatelessWidget {
  const ProductSkeletonCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: JColors.paper,
        borderRadius: BorderRadius.circular(JRadius.md),
        border: Border.all(color: JColors.line),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            height: 120,
            width: double.infinity,
            child: ColoredBox(color: JColors.sand),
          ),
          Padding(
            padding: EdgeInsets.all(JSpace.s12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _Bar(100),
                SizedBox(height: JSpace.s8),
                _Bar(141),
                SizedBox(height: JSpace.s8),
                _Bar(72),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Two skeleton cards in a grid row's place (the caller pads it like the grid).
class ProductSkeletonRow extends StatelessWidget {
  const ProductSkeletonRow({super.key});

  @override
  Widget build(BuildContext context) => const SizedBox(
    height: 198,
    child: Row(
      children: [
        Expanded(child: ProductSkeletonCard()),
        SizedBox(width: JSpace.s12),
        Expanded(child: ProductSkeletonCard()),
      ],
    ),
  );
}

/// Loading placeholder of a category tile.
class CategorySkeletonTile extends StatelessWidget {
  const CategorySkeletonTile({super.key});

  @override
  Widget build(BuildContext context) => const SizedBox(
    width: 84,
    child: Column(
      children: [
        SizedBox.square(
          dimension: 72,
          child: DecoratedBox(
            decoration: BoxDecoration(color: JColors.sand, shape: BoxShape.circle),
          ),
        ),
        SizedBox(height: JSpace.s8),
        _Bar(56),
      ],
    ),
  );
}

/// Four tiles per row, spread edge to edge (Figma's `space between` rows).
class TileRows extends StatelessWidget {
  const TileRows({required this.children, super.key, this.gap = JSpace.s16});

  final List<Widget> children;
  final double gap;

  @override
  Widget build(BuildContext context) => Column(
    children: [
      for (var i = 0; i < children.length; i += 4) ...[
        if (i > 0) SizedBox(height: gap),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: children.sublist(i, (i + 4).clamp(0, children.length)),
        ),
      ],
    ],
  );
}

/// Warning notice with a clock: stores paused (home), store closed (store page).
class CatalogNotice extends StatelessWidget {
  const CatalogNotice(this.text, {super.key});

  final String text;

  @override
  Widget build(BuildContext context) => Container(
    width: double.infinity,
    padding: const EdgeInsets.symmetric(horizontal: JSpace.s16, vertical: JSpace.s12),
    decoration: BoxDecoration(color: JColors.warningBg, borderRadius: BorderRadius.circular(JRadius.md)),
    child: Row(
      children: [
        const Icon(JIcons.clock, size: 24, color: JColors.ink),
        const SizedBox(width: JSpace.s12),
        Expanded(child: Text(text, style: JText.bodyM)),
      ],
    ),
  );
}

/// The failure panel: "no internet" for network failures, the screen's own error otherwise.
class CatalogErrorPanel extends StatelessWidget {
  const CatalogErrorPanel({
    required this.error,
    required this.title,
    required this.body,
    required this.onRetry,
    super.key,
  });

  final Object error;
  final String title;
  final String body;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final offline = ApiError.from(error).code == ApiError.network;
    return JEmptyState(
      kind: offline ? JEmptyStateKind.offline : JEmptyStateKind.error,
      title: offline ? l10n.offlineTitle : title,
      body: offline ? l10n.offlineBody : body,
      actionLabel: l10n.retry,
      onAction: onRetry,
    );
  }
}

/// The end of a paged grid: a spinner while the next page loads, a retry line when it failed.
class PagedFooter<T> extends StatelessWidget {
  const PagedFooter({required this.list, required this.onRetry, super.key});

  final PagedList<T> list;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    if (list.moreError != null) {
      return Padding(
        padding: const EdgeInsets.all(JSpace.s16),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(l10n.loadMoreFailed, style: JText.bodyM.copyWith(color: JColors.ink2)),
            TextButton(onPressed: onRetry, child: Text(l10n.retry)),
          ],
        ),
      );
    }
    if (!list.loadingMore) return const SizedBox(height: JSpace.s16);
    return const Padding(
      padding: EdgeInsets.all(JSpace.s16),
      child: Center(child: CircularProgressIndicator(color: JColors.ember)),
    );
  }
}

/// Calls [onEnd] when a scroll gets near the end of its content (infinite scroll).
class LoadMoreListener extends StatelessWidget {
  const LoadMoreListener({required this.onEnd, required this.child, super.key});

  final VoidCallback onEnd;
  final Widget child;

  @override
  Widget build(BuildContext context) => NotificationListener<Notification>(
    onNotification: (n) {
      if (n is ScrollUpdateNotification) _check(n.metrics);
      // A page too short to scroll sends no updates: check after its layout. The notification itself can
      // describe the previous frame (the skeleton), so read the position once the next frame is laid out.
      if (n is ScrollMetricsNotification) {
        final context = n.context;
        WidgetsBinding.instance.addPostFrameCallback((_) {
          final position = context.mounted ? Scrollable.maybeOf(context)?.position : null;
          if (position != null && position.hasContentDimensions) _check(position);
        });
      }
      return false;
    },
    child: child,
  );

  void _check(ScrollMetrics m) {
    if (m.axis == Axis.vertical && m.extentAfter < 600) onEnd();
  }
}

/// Pull-to-refresh wants a future that does not throw: a failed refresh shows the error panel instead.
Future<void> quietly(Future<Object?> f) => f.then<void>((_) {}, onError: (_) {});

/// A paged product list as slivers: skeleton, error, [empty], or the grid with its footer.
/// Wrap the scroll view in [LoadMoreListener] calling `loadMore` on the same query.
List<Widget> productSlivers(
  BuildContext context,
  WidgetRef ref,
  ProductQuery query, {
  required Widget empty,
  bool storeClosed = false,
}) {
  final l10n = AppLocalizations.of(context);
  final pages = ref.watch(productPagesProvider(query));
  return pages.when(
    loading: () => [
      const SliverToBoxAdapter(
        child: Padding(padding: ProductGrid.padding, child: ProductSkeletonRow()),
      ),
    ],
    error: (e, _) => [
      SliverToBoxAdapter(
        child: CatalogErrorPanel(
          error: e,
          title: l10n.productsErrorTitle,
          body: l10n.productsErrorBody,
          onRetry: () => ref.invalidate(productPagesProvider(query)),
        ),
      ),
    ],
    data: (list) => list.items.isEmpty
        ? [SliverToBoxAdapter(child: empty)]
        : [
            SliverPadding(
              padding: ProductGrid.padding,
              sliver: SliverGrid.builder(
                gridDelegate: ProductGrid.delegate,
                itemCount: list.items.length,
                itemBuilder: (_, i) => ProductTile(list.items[i], storeClosed: storeClosed),
              ),
            ),
            SliverToBoxAdapter(
              child: PagedFooter(
                list: list,
                onRetry: () => ref.read(productPagesProvider(query).notifier).loadMore(retry: true),
              ),
            ),
          ],
  );
}
