import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:jazlah/app/router/router.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/cart/presentation/cart_providers.dart';
import 'package:jazlah/features/catalog/domain/catalog.dart';
import 'package:jazlah/features/catalog/presentation/catalog_providers.dart';
import 'package:jazlah/features/catalog/presentation/catalog_widgets.dart';
import 'package:jazlah/features/location/presentation/choose_location.dart';
import 'package:jazlah/features/location/presentation/location_providers.dart';
import 'package:jazlah/features/location/presentation/map_picker_screen.dart';
import 'package:jazlah/l10n/app_localizations.dart';

/// Home (Figma 118-6999 and its states): location header, banners, categories, best sellers and
/// partner stores. Asks for a location once per session while none is set.
class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

/// The automatic prompt runs once per app session, not on every return to the tab.
bool _askedThisSession = false;

class _HomeScreenState extends ConsumerState<HomeScreen> with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) unawaited(ref.read(selectedLocationProvider.notifier).recheck());
      if (!mounted || _askedThisSession || ref.read(selectedLocationProvider) != null) return;
      _askedThisSession = true;
      unawaited(chooseLocation(context, ref));
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) unawaited(ref.read(selectedLocationProvider.notifier).recheck());
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final location = ref.watch(selectedLocationProvider);
    final feed = ref.watch(homeFeedProvider);
    final search = JSearchBar(
      placeholder: l10n.homeSearchHint,
      clearLabel: l10n.clear,
      filterLabel: l10n.filters,
      onTap: () => context.push(Routes.search),
      onFilter: () => context.push(Routes.search),
    );
    final children = <Widget>[
      // Outside every zone the app still browses; pickup replaces delivery.
      if (location != null && !location.covered) LocationBanner(text: l10n.locHomeOutOfCoverage),
      ...feed.when(
        loading: () => [search, ..._loading()],
        error: (e, _) => [
          CatalogErrorPanel(
            error: e,
            title: l10n.homeErrorTitle,
            body: l10n.homeErrorBody,
            onRetry: () => ref.invalidate(homeFeedProvider),
          ),
        ],
        data: (f) => f.isEmpty
            ? [
                JEmptyState(
                  kind: JEmptyStateKind.location,
                  title: l10n.homeEmptyTitle,
                  body: l10n.homeEmptyBody,
                  actionLabel: l10n.homeChangeAddress,
                  onAction: () => chooseLocation(context, ref),
                ),
              ]
            : [
                if (f.storesPaused) CatalogNotice(l10n.homeStoresPaused),
                search,
                ..._sections(context, f),
              ],
      ),
    ];
    return SafeArea(
      bottom: false,
      child: Column(
        children: [
          JAppHeader.home(
            title: l10n.appName,
            location: location?.line.isNotEmpty ?? false ? location!.line : l10n.locChoose,
            notificationsLabel: l10n.menuNotifications,
            cartLabel: l10n.cart,
            onLocationTap: () => chooseLocation(context, ref),
            onNotifications: () => context.push(Routes.notifications),
            onCart: () => openCart(context),
            cartCount: ref.watch(cartCountProvider),
          ),
          Expanded(
            child: RefreshIndicator(
              color: JColors.ember,
              onRefresh: () => quietly(ref.refresh(homeFeedProvider.future)),
              child: ListView.separated(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(JSpace.s16),
                itemCount: children.length,
                separatorBuilder: (_, _) => const SizedBox(height: JSpace.s16),
                itemBuilder: (_, i) => children[i],
              ),
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _loading() => [
    Container(
      height: 160,
      decoration: BoxDecoration(color: JColors.sand, borderRadius: BorderRadius.circular(JRadius.lg)),
    ),
    TileRows(children: [for (var i = 0; i < 4; i++) const CategorySkeletonTile()]),
    const Padding(
      padding: EdgeInsetsDirectional.only(end: JSpace.s16),
      child: ProductSkeletonRow(),
    ),
  ];

  List<Widget> _sections(BuildContext context, HomeFeed f) {
    final l10n = AppLocalizations.of(context);
    final cards = f.bestSellers;
    return [
      if (f.banners.isNotEmpty) _Banners(f.banners),
      if (f.categories.isNotEmpty) ...[
        JSectionHeader(
          title: l10n.homeCategories,
          actionLabel: l10n.seeAll,
          onAction: () => context.push(Routes.categories),
        ),
        Column(
          children: [
            for (var i = 0; i < f.categories.length; i += 2) ...[
              if (i > 0) const SizedBox(height: JSpace.s12),
              Row(
                children: [
                  Expanded(child: _CategoryPhoto(f.categories[i])),
                  const SizedBox(width: JSpace.s16),
                  Expanded(child: i + 1 < f.categories.length ? _CategoryPhoto(f.categories[i + 1]) : const SizedBox()),
                ],
              ),
            ],
          ],
        ),
      ],
      if (cards.isNotEmpty) ...[
        JSectionHeader(
          title: l10n.homeBestSellers,
          actionLabel: l10n.seeAll,
          onAction: () => context.push(Routes.search),
        ),
        // Figma's grid: 165-wide cards from the start edge.
        Padding(
          padding: const EdgeInsetsDirectional.only(end: JSpace.s16),
          child: Column(
            children: [
              for (var i = 0; i < cards.length; i += 2) ...[
                if (i > 0) const SizedBox(height: JSpace.s12),
                IntrinsicHeight(
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Expanded(child: ProductTile(cards[i])),
                      const SizedBox(width: JSpace.s12),
                      Expanded(child: i + 1 < cards.length ? ProductTile(cards[i + 1]) : const SizedBox()),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
      ],
      if (f.partnerStores.isNotEmpty) ...[
        JSectionHeader(
          title: l10n.homePartnerStores,
          actionLabel: l10n.seeAll,
          onAction: () => context.push(Routes.stores),
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          // Flexible: the 104 cards shrink on phones narrower than 344.
          children: [
            for (final (i, s) in f.partnerStores.take(3).indexed) ...[
              if (i > 0) const SizedBox(width: JSpace.s8),
              Flexible(child: StoreCardTile(s)),
            ],
          ],
        ),
      ],
    ];
  }
}

/// Home category tile: a photo under a dark gradient with the name at the bottom.
class _CategoryPhoto extends StatelessWidget {
  const _CategoryPhoto(this.category);

  final Category category;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => context.push(Routes.category(category.id), extra: category.name.of(context.lang)),
        child: Container(
          height: 96,
          clipBehavior: Clip.antiAlias,
          decoration: BoxDecoration(borderRadius: BorderRadius.circular(JRadius.md)),
          child: Stack(
            fit: StackFit.expand,
            children: [
              CatalogImage(category.imageUrl),
              const DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [Color(0x0D240809), Color(0xD1240809)],
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: JSpace.s12),
                child: Align(
                  alignment: AlignmentDirectional.bottomStart,
                  child: Text(
                    category.name.of(context.lang),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: JText.raw(16, FontWeight.w700, color: JColors.paper),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Banners carousel with page dots (the mock's banners; none from the API until CMS-API-1).
class _Banners extends StatefulWidget {
  const _Banners(this.banners);

  final List<HomeBanner> banners;

  @override
  State<_Banners> createState() => _BannersState();
}

class _BannersState extends State<_Banners> {
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    final lang = context.lang;
    return Column(
      children: [
        SizedBox(
          height: 150,
          child: PageView(
            onPageChanged: (i) => setState(() => _index = i),
            children: [
              for (final b in widget.banners)
                Container(
                  clipBehavior: Clip.antiAlias,
                  decoration: BoxDecoration(borderRadius: BorderRadius.circular(22)),
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      CatalogImage(b.imageUrl),
                      const DecoratedBox(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: AlignmentDirectional.topStart,
                            end: AlignmentDirectional.bottomEnd,
                            colors: [Color(0x8C240809), Color(0xEB240809)],
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: JSpace.s20, vertical: 18),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (b.tag != null) ...[
                              Container(
                                height: 22,
                                padding: const EdgeInsets.symmetric(horizontal: 10),
                                decoration: BoxDecoration(
                                  color: JColors.goldLight,
                                  borderRadius: BorderRadius.circular(JRadius.pill),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(JIcons.starFill, size: 12, color: JColors.brandDeep),
                                    const SizedBox(width: 6),
                                    Text(
                                      b.tag!.of(lang),
                                      style: JText.raw(11, FontWeight.w700, color: JColors.brandDeep),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 6),
                            ],
                            Text(
                              b.title.of(lang),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: JText.raw(22, FontWeight.w700, color: JColors.paper).copyWith(
                                fontFamily: JText.displayFamily,
                              ),
                            ),
                            if (b.body != null) ...[
                              const SizedBox(height: 6),
                              Text(
                                b.body!.of(lang),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: JText.raw(12, FontWeight.w400, color: JColors.paper),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
        if (widget.banners.length > 1) ...[
          const SizedBox(height: JSpace.s16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              for (var i = 0; i < widget.banners.length; i++) ...[
                if (i > 0) const SizedBox(width: JSpace.s8),
                AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  width: i == _index ? 28 : 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: i == _index ? JColors.ember : JColors.line,
                    borderRadius: BorderRadius.circular(JRadius.pill),
                  ),
                ),
              ],
            ],
          ),
        ],
      ],
    );
  }
}
