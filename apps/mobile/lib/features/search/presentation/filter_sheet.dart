import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/catalog/domain/catalog.dart';
import 'package:jazlah/features/catalog/presentation/catalog_providers.dart';
import 'package:jazlah/features/catalog/presentation/catalog_widgets.dart';
import 'package:jazlah/features/search/domain/search.dart';
import 'package:jazlah/features/search/presentation/search_providers.dart';
import 'package:jazlah/l10n/app_localizations.dart';

/// Opens the filters sheet (Figma 86-13223); resolves to the new query, or null when dismissed.
Future<SearchQuery?> showFilterSheet(BuildContext context, SearchQuery query) => showJBottomSheet<SearchQuery>(
  context,
  title: AppLocalizations.of(context).searchFiltersTitle,
  builder: (_) => FilterSheet(query: query),
);

/// Price range, store, category, "available now only" and (mock only) sort. The main button shows
/// how many products the choices find, when the repository can count.
class FilterSheet extends StatefulWidget {
  const FilterSheet({required this.query, super.key});

  final SearchQuery query;

  /// The slider's top, in riyals; at the top there is no upper bound.
  static const maxRiyals = 500.0;

  @override
  State<FilterSheet> createState() => _FilterSheetState();
}

class _FilterSheetState extends State<FilterSheet> {
  late RangeValues _price;
  late String? _vendorId = widget.query.vendorId;
  late String? _categoryId = widget.query.categoryId;
  late bool _available = widget.query.availableOnly;
  late ProductSort _sort = widget.query.sort;
  int? _count;

  @override
  void initState() {
    super.initState();
    final q = widget.query;
    _price = RangeValues((q.minPriceHalalas ?? 0) / 100, (q.maxPriceHalalas ?? FilterSheet.maxRiyals * 100) / 100);
  }

  SearchQuery get _draft => SearchQuery(
    text: widget.query.text,
    categoryId: _categoryId,
    vendorId: _vendorId,
    minPriceHalalas: _price.start > 0 ? (_price.start * 100).round() : null,
    maxPriceHalalas: _price.end < FilterSheet.maxRiyals ? (_price.end * 100).round() : null,
    availableOnly: _available,
    sort: _sort,
  );

  void _reset() => setState(() {
    _price = const RangeValues(0, FilterSheet.maxRiyals);
    _vendorId = null;
    _categoryId = null;
    _available = false;
    _sort = ProductSort.popular;
  });

  Widget _group(String title, Widget child) => Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      Text(title, style: JText.h3),
      const SizedBox(height: JSpace.s8),
      child,
    ],
  );

  Widget _chips(List<Widget> chips) => SizedBox(
    height: 40,
    child: ListView.separated(
      scrollDirection: Axis.horizontal,
      itemCount: chips.length,
      separatorBuilder: (_, _) => const SizedBox(width: JSpace.s8),
      itemBuilder: (_, i) => chips[i],
    ),
  );

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Consumer(
      builder: (context, ref, _) {
        final repo = ref.watch(searchRepositoryProvider);
        final draft = _draft;
        final count = ref.watch(searchCountProvider(draft));
        // Keeps the last number while the next one loads, so the button does not flicker.
        if (count.hasValue) _count = count.value;
        final stores = ref.watch(storePagesProvider).value?.items ?? const <Store>[];
        final categories = ref.watch(categoriesProvider).value ?? const <Category>[];
        final top = _price.end >= FilterSheet.maxRiyals;
        final sorts = {
          ProductSort.popular: l10n.sortPopular,
          ProductSort.priceAsc: l10n.sortPriceAsc,
          ProductSort.priceDesc: l10n.sortPriceDesc,
        };
        return Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            ConstrainedBox(
              constraints: BoxConstraints(maxHeight: MediaQuery.sizeOf(context).height * 0.6),
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _group(
                      l10n.searchPrice,
                      Column(
                        children: [
                          SizedBox(
                            height: 24,
                            child: SliderTheme(
                              data: SliderThemeData(
                                padding: EdgeInsets.zero,
                                trackHeight: 4,
                                activeTrackColor: JColors.ember,
                                inactiveTrackColor: JColors.line,
                                activeTickMarkColor: Colors.transparent,
                                inactiveTickMarkColor: Colors.transparent,
                                thumbColor: JColors.ember,
                                overlayColor: JColors.ember.withValues(alpha: 0.12),
                                rangeThumbShape: const RoundRangeSliderThumbShape(enabledThumbRadius: 12, elevation: 0),
                                rangeTrackShape: const RoundedRectRangeSliderTrackShape(),
                                showValueIndicator: ShowValueIndicator.never,
                              ),
                              child: RangeSlider(
                                values: _price,
                                max: FilterSheet.maxRiyals,
                                divisions: 50,
                                onChanged: (v) => setState(() => _price = v),
                              ),
                            ),
                          ),
                          const SizedBox(height: JSpace.s8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Flexible(
                                child: Text(
                                  l10n.searchPriceMin(formatHalalas((_price.start * 100).round())),
                                  style: JText.bodyM.copyWith(color: JColors.ink2),
                                ),
                              ),
                              const SizedBox(width: JSpace.s8),
                              Flexible(
                                child: Text(
                                  l10n.searchPriceMax(
                                    '${formatHalalas((_price.end * 100).round())}${top ? '+' : ''}',
                                  ),
                                  textAlign: TextAlign.end,
                                  style: JText.bodyM.copyWith(color: JColors.ink2),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: JSpace.s16),
                    _group(
                      l10n.searchStore,
                      _chips([
                        JChip(
                          label: l10n.seeAll,
                          selected: _vendorId == null,
                          onTap: () => setState(() => _vendorId = null),
                        ),
                        for (final s in stores)
                          JChip(
                            label: s.name.of(context.lang),
                            selected: _vendorId == s.id,
                            onTap: () => setState(() => _vendorId = s.id),
                          ),
                      ]),
                    ),
                    const SizedBox(height: JSpace.s16),
                    _group(
                      l10n.searchCategory,
                      _chips([
                        for (final c in categories)
                          JChip(
                            label: c.name.of(context.lang),
                            selected: _categoryId == c.id,
                            // A second tap clears it (the row has no "all" chip in Figma).
                            onTap: () => setState(() => _categoryId = _categoryId == c.id ? null : c.id),
                          ),
                      ]),
                    ),
                    // Figma has no sort control: the least intrusive place is a chip group here.
                    if (repo.canSort) ...[
                      const SizedBox(height: JSpace.s16),
                      _group(
                        l10n.searchSort,
                        _chips([
                          for (final MapEntry(key: sort, value: label) in sorts.entries)
                            JChip(label: label, selected: _sort == sort, onTap: () => setState(() => _sort = sort)),
                        ]),
                      ),
                    ],
                    if (repo.canFilterAvailable) ...[
                      const SizedBox(height: JSpace.s16),
                      Align(
                        alignment: AlignmentDirectional.centerStart,
                        child: JSwitch(
                          checked: _available,
                          label: l10n.searchAvailableOnly,
                          onChanged: (v) => setState(() => _available = v),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: JSpace.s16),
            JButton(
              label: _count == null ? l10n.searchShowResults : l10n.searchShowCount(_count!),
              expand: true,
              onPressed: () => Navigator.of(context).pop(draft),
            ),
            const SizedBox(height: JSpace.s16),
            JButton(label: l10n.searchReset, variant: JButtonVariant.ghost, expand: true, onPressed: _reset),
          ],
        );
      },
    );
  }
}
