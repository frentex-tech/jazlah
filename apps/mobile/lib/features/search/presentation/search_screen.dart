import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jazlah/app/router/router.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/catalog/domain/catalog.dart';
import 'package:jazlah/features/catalog/presentation/catalog_providers.dart';
import 'package:jazlah/features/catalog/presentation/catalog_widgets.dart';
import 'package:jazlah/features/search/domain/search.dart';
import 'package:jazlah/features/search/presentation/filter_sheet.dart';
import 'package:jazlah/features/search/presentation/search_providers.dart';
import 'package:jazlah/l10n/app_localizations.dart';

/// Product search (Figma 86-12826 start, 86-12881 typing, 86-12931 results, 86-13056 results loading,
/// 86-13112 no results, 86-13149 error, 86-13186 offline, 86-13223 filters). The words and filters
/// live in this page's state, so they are still there when the user comes back from a product.
class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({
    super.key,
    this.initial = const SearchQuery(),
    this.debounce = const Duration(milliseconds: 350),
  });

  /// Opens on these words and filters (design QA and tests).
  final SearchQuery initial;

  /// The pause in typing before a search runs.
  final Duration debounce;

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final _controller = TextEditingController();
  final _focus = FocusNode();
  Timer? _debounce;
  late SearchQuery _query = widget.initial;

  /// Typed words not searched yet: the suggestions skeleton shows.
  bool _typing = false;

  @override
  void initState() {
    super.initState();
    _controller.text = widget.initial.text;
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _controller.dispose();
    _focus.dispose();
    super.dispose();
  }

  void _onChanged(String value) {
    _debounce?.cancel();
    final text = value.trim();
    if (text.isEmpty) {
      setState(() {
        _typing = false;
        _query = _query.withText('');
      });
      return;
    }
    setState(() => _typing = true);
    _debounce = Timer(widget.debounce, () {
      if (mounted) {
        setState(() {
          _typing = false;
          _query = _query.withText(text);
        });
      }
    });
  }

  /// Searches at once and keeps the words as a recent search.
  void _search(String value) {
    _debounce?.cancel();
    final text = value.trim();
    if (_controller.text != value) _controller.text = value;
    _focus.unfocus();
    setState(() {
      _typing = false;
      _query = _query.withText(text);
    });
    unawaited(ref.read(recentSearchesProvider.notifier).add(text));
  }

  Future<void> _filters() async {
    _focus.unfocus();
    final next = await showFilterSheet(context, _query);
    if (next != null && mounted) setState(() => _query = next);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            JAppHeader.page(
              title: l10n.searchTitle,
              cartLabel: l10n.cart,
              onBack: () => popOrHome(context),
              onCart: () => openCart(context),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(JSpace.s16, JSpace.s16, JSpace.s16, 0),
              child: JSearchBar(
                controller: _controller,
                focusNode: _focus,
                autofocus: widget.initial.isEmpty,
                placeholder: l10n.homeSearchHint,
                clearLabel: l10n.clear,
                filterLabel: l10n.filters,
                onFilter: _filters,
                onChanged: _onChanged,
                onSubmitted: _search,
              ),
            ),
            Expanded(
              child: _typing
                  ? const _Suggestions()
                  : _query.isEmpty
                  ? _Start(onSearch: _search)
                  : _Results(
                      query: _query,
                      onFilters: _filters,
                      onClearFilters: () => setState(() => _query = _query.withoutFilters),
                      onOpen: () => unawaited(ref.read(recentSearchesProvider.notifier).add(_query.text)),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Recent searches (with "clear") and the most searched words.
class _Start extends ConsumerWidget {
  const _Start({required this.onSearch});

  final ValueChanged<String> onSearch;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final recent = ref.watch(recentSearchesProvider);
    final popular = ref.watch(popularSearchesProvider).value ?? const <LocalizedText>[];
    return ListView(
      padding: const EdgeInsets.all(JSpace.s16),
      keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
      children: [
        if (recent.isNotEmpty) ...[
          Row(
            children: [
              Expanded(child: Text(l10n.searchRecent, style: JText.h2)),
              GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: () => ref.read(recentSearchesProvider.notifier).clear(),
                child: Text(l10n.clear, style: JText.labelM.copyWith(color: JColors.ink2)),
              ),
            ],
          ),
          const SizedBox(height: JSpace.s16),
          Wrap(
            spacing: JSpace.s8,
            runSpacing: JSpace.s8,
            children: [for (final r in recent) JChip(label: r, onTap: () => onSearch(r))],
          ),
          const SizedBox(height: JSpace.s16),
        ],
        if (popular.isNotEmpty) ...[
          Text(l10n.searchPopular, style: JText.h2),
          const SizedBox(height: JSpace.s16),
          for (final (i, p) in popular.indexed) ...[
            if (i > 0) const SizedBox(height: JSpace.s4),
            InkWell(
              onTap: () => onSearch(p.of(context.lang)),
              child: SizedBox(
                height: 44,
                child: Row(
                  children: [
                    const Icon(JIcons.trendUp, size: 20, color: JColors.ink2),
                    const SizedBox(width: JSpace.s12),
                    Expanded(child: Text(p.of(context.lang), style: JText.bodyL)),
                  ],
                ),
              ),
            ),
          ],
        ],
      ],
    );
  }
}

/// While the user types: list skeleton rows.
class _Suggestions extends StatelessWidget {
  const _Suggestions();

  @override
  Widget build(BuildContext context) => ListView.separated(
    padding: const EdgeInsets.all(JSpace.s16),
    physics: const NeverScrollableScrollPhysics(),
    itemCount: 4,
    separatorBuilder: (_, _) => const SizedBox(height: JSpace.s12),
    itemBuilder: (_, _) => const JSkeletonRow(),
  );
}

class _Results extends ConsumerWidget {
  const _Results({required this.query, required this.onFilters, required this.onClearFilters, required this.onOpen});

  final SearchQuery query;
  final VoidCallback onFilters;
  final VoidCallback onClearFilters;
  final VoidCallback onOpen;

  /// Whole riyals on the chips ("up to 100 SAR").
  static String _riyals(int halalas) => '${halalas ~/ 100}';

  List<String> _activeChips(AppLocalizations l10n, WidgetRef ref, String lang) {
    final q = query;
    final store = q.vendorId == null
        ? null
        : ref.watch(storePagesProvider).value?.items.where((s) => s.id == q.vendorId).firstOrNull;
    final category = q.categoryId == null
        ? null
        : ref.watch(categoriesProvider).value?.where((c) => c.id == q.categoryId).firstOrNull;
    return [
      if (q.minPriceHalalas != null && q.maxPriceHalalas != null)
        l10n.searchPriceRange(_riyals(q.minPriceHalalas!), _riyals(q.maxPriceHalalas!))
      else if (q.maxPriceHalalas != null)
        l10n.searchPriceUpTo(_riyals(q.maxPriceHalalas!))
      else if (q.minPriceHalalas != null)
        l10n.searchPriceMin(_riyals(q.minPriceHalalas!)),
      if (store != null) store.name.of(lang),
      if (category != null) category.name.of(lang),
      if (q.availableOnly) l10n.searchAvailable,
    ];
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final pages = ref.watch(searchPagesProvider(query));
    final slivers = pages.when<List<Widget>>(
      loading: () => [
        const SliverPadding(
          padding: EdgeInsetsDirectional.only(start: JSpace.s16, end: 32, top: JSpace.s12),
          sliver: SliverToBoxAdapter(
            child: Column(
              children: [
                ProductSkeletonRow(),
                SizedBox(height: JSpace.s12),
                ProductSkeletonRow(),
              ],
            ),
          ),
        ),
      ],
      error: (e, _) => [
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(JSpace.s16, JSpace.s12, JSpace.s16, 0),
          sliver: SliverToBoxAdapter(
            child: CatalogErrorPanel(
              error: e,
              title: l10n.searchErrorTitle,
              body: l10n.searchErrorBody,
              onRetry: () => ref.invalidate(searchPagesProvider(query)),
            ),
          ),
        ),
      ],
      data: (list) => list.items.isEmpty
          ? [
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(JSpace.s16, JSpace.s12, JSpace.s16, 0),
                sliver: SliverToBoxAdapter(
                  child: JEmptyState(
                    kind: JEmptyStateKind.search,
                    title: query.text.isEmpty ? l10n.searchNoResults : l10n.searchNoResultsFor(query.text),
                    body: l10n.searchNoResultsBody,
                    actionLabel: query.activeFilters > 0 ? l10n.searchClearFilters : null,
                    onAction: onClearFilters,
                  ),
                ),
              ),
            ]
          : [
              SliverToBoxAdapter(child: _header(context, ref, l10n)),
              SliverPadding(
                padding: ProductGrid.padding,
                sliver: SliverGrid.builder(
                  gridDelegate: ProductGrid.delegate,
                  itemCount: list.items.length,
                  itemBuilder: (_, i) => ProductTile(list.items[i], onOpen: onOpen),
                ),
              ),
              SliverToBoxAdapter(
                child: PagedFooter(
                  list: list,
                  onRetry: () => ref.read(searchPagesProvider(query).notifier).loadMore(retry: true),
                ),
              ),
            ],
    );
    return LoadMoreListener(
      onEnd: () => ref.read(searchPagesProvider(query).notifier).loadMore(),
      child: CustomScrollView(keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag, slivers: slivers),
    );
  }

  /// Count, filter button with the active count, and the active filters as chips (tap: the sheet).
  Widget _header(BuildContext context, WidgetRef ref, AppLocalizations l10n) {
    final count = ref.watch(searchCountProvider(query)).value;
    final chips = _activeChips(l10n, ref, context.lang);
    final n = query.activeFilters;
    return Padding(
      padding: const EdgeInsets.fromLTRB(JSpace.s16, JSpace.s12, JSpace.s16, JSpace.s12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Expanded(
                child: count == null
                    ? const SizedBox.shrink()
                    : Text(
                        query.text.isEmpty ? l10n.searchResults(count) : l10n.searchResultsFor(count, query.text),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: JText.bodyM.copyWith(color: JColors.ink2),
                      ),
              ),
              const SizedBox(width: JSpace.s12),
              JButton(
                label: n > 0 ? l10n.searchFilterCount(n) : l10n.filters,
                variant: JButtonVariant.secondary,
                size: JButtonSize.s,
                onPressed: onFilters,
              ),
            ],
          ),
          if (chips.isNotEmpty) ...[
            const SizedBox(height: JSpace.s12),
            SizedBox(
              height: 40,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: chips.length,
                separatorBuilder: (_, _) => const SizedBox(width: JSpace.s8),
                itemBuilder: (_, i) => JChip(label: chips[i], selected: true, onTap: onFilters),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
