import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jazlah/app/router/router.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/catalog/presentation/catalog_providers.dart';
import 'package:jazlah/features/catalog/presentation/catalog_widgets.dart';
import 'package:jazlah/l10n/app_localizations.dart';

/// Every store, paged (home "All" on partner stores). Figma has no screen for it: the home store
/// cards in a grid, with the shared states.
class StoresScreen extends ConsumerWidget {
  const StoresScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final pages = ref.watch(storePagesProvider);
    final slivers = pages.when(
      loading: () => [
        const SliverToBoxAdapter(
          child: Padding(padding: ProductGrid.padding, child: ProductSkeletonRow()),
        ),
      ],
      error: (e, _) => [
        SliverToBoxAdapter(
          child: CatalogErrorPanel(
            error: e,
            title: l10n.storeErrorTitle,
            body: l10n.storeErrorBody,
            onRetry: () => ref.invalidate(storePagesProvider),
          ),
        ),
      ],
      data: (list) => list.items.isEmpty
          ? [
              SliverToBoxAdapter(
                child: JEmptyState(
                  kind: JEmptyStateKind.location,
                  title: l10n.homeEmptyTitle,
                  body: l10n.homeEmptyBody,
                ),
              ),
            ]
          : [
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: JSpace.s16),
                sliver: SliverGrid.builder(
                  gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                    maxCrossAxisExtent: 120,
                    mainAxisExtent: 145,
                    mainAxisSpacing: JSpace.s12,
                    crossAxisSpacing: JSpace.s12,
                  ),
                  itemCount: list.items.length,
                  itemBuilder: (_, i) => Center(child: StoreCardTile(list.items[i])),
                ),
              ),
              SliverToBoxAdapter(
                child: PagedFooter(
                  list: list,
                  onRetry: () => ref.read(storePagesProvider.notifier).loadMore(retry: true),
                ),
              ),
            ],
    );
    return SafeArea(
      bottom: false,
      child: Column(
        children: [
          JAppHeader.page(
            title: l10n.storesTitle,
            cartLabel: l10n.cart,
            onCart: () => openCart(context),
            onBack: () => popOrHome(context),
          ),
          Expanded(
            child: LoadMoreListener(
              onEnd: () => ref.read(storePagesProvider.notifier).loadMore(),
              child: RefreshIndicator(
                color: JColors.ember,
                onRefresh: () => quietly(ref.refresh(storePagesProvider.future)),
                child: CustomScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  slivers: [
                    const SliverToBoxAdapter(child: SizedBox(height: JSpace.s16)),
                    ...slivers,
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
