import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:jazlah/app/router/router.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/catalog/presentation/catalog_providers.dart';
import 'package:jazlah/features/catalog/presentation/catalog_widgets.dart';
import 'package:jazlah/l10n/app_localizations.dart';

/// All categories (Figma 118-7909, loading 118-8015, empty 118-8092, error 118-8137).
class CategoriesScreen extends ConsumerWidget {
  const CategoriesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final categories = ref.watch(categoriesProvider);
    final body = categories.when(
      loading: () => [
        TileRows(children: [for (var i = 0; i < 12; i++) const CategorySkeletonTile()]),
      ],
      error: (e, _) => [
        CatalogErrorPanel(
          error: e,
          title: l10n.categoriesErrorTitle,
          body: l10n.categoriesErrorBody,
          onRetry: () => ref.invalidate(categoriesProvider),
        ),
      ],
      data: (list) => list.isEmpty
          ? [
              JEmptyState(
                kind: JEmptyStateKind.search,
                title: l10n.categoriesEmptyTitle,
                body: l10n.categoriesEmptyBody,
                actionLabel: l10n.backToHome,
                onAction: () => context.go(Routes.home),
              ),
            ]
          : [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(l10n.homeCategories, style: JText.h1),
                  const SizedBox(height: JSpace.s8),
                  Text(l10n.categoriesSubtitle, style: JText.bodyM.copyWith(color: JColors.ink2)),
                ],
              ),
              TileRows(
                children: [
                  for (final c in list)
                    JCategoryTile(
                      image: CatalogImage(c.imageUrl),
                      label: c.name.of(context.lang),
                      onTap: () => context.push(Routes.category(c.id)),
                    ),
                  const _ComingTile(),
                ],
              ),
            ],
    );
    return SafeArea(
      bottom: false,
      child: Column(
        children: [
          JAppHeader.page(title: l10n.homeCategories, cartLabel: l10n.cart, onBack: () => popOrHome(context)),
          Expanded(
            child: RefreshIndicator(
              color: JColors.ember,
              onRefresh: () => quietly(ref.refresh(categoriesProvider.future)),
              child: ListView.separated(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(JSpace.s16),
                itemCount: body.length,
                separatorBuilder: (_, _) => const SizedBox(height: JSpace.s16),
                itemBuilder: (_, i) => body[i],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// "More coming": a plain ring with a plus after the last category.
class _ComingTile extends StatelessWidget {
  const _ComingTile();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 84,
      child: Column(
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: JColors.line),
            ),
            child: const Icon(JIcons.plus, size: 22, color: JColors.muted),
          ),
          const SizedBox(height: JSpace.s8),
          Text(
            AppLocalizations.of(context).categoriesComing,
            textAlign: TextAlign.center,
            style: JText.raw(12, FontWeight.w400, color: JColors.muted),
          ),
        ],
      ),
    );
  }
}
