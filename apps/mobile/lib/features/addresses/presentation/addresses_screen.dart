import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:jazlah/app/router/router.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/addresses/domain/address.dart';
import 'package:jazlah/features/addresses/presentation/address_providers.dart';
import 'package:jazlah/features/location/presentation/map_picker_screen.dart';
import 'package:jazlah/l10n/app_localizations.dart';

/// Addresses/List (Figma 86-8871 default, 86-8947 empty, 86-9041 loading, 86-9115 error).
/// Default badge as in Figma; the coverage tag and the lock (not in Figma) use the design-system Badge
/// and the lock icon in place of the edit icon.
class AddressesScreen extends ConsumerWidget {
  const AddressesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final addresses = ref.watch(addressesProvider);
    return SafeArea(
      bottom: false,
      child: Column(
        children: [
          JAppHeader.page(title: l10n.addrTitle, cartLabel: l10n.cart, onBack: () => context.go(Routes.account)),
          Expanded(
            child: addresses.when(
              loading: () => ListView(
                padding: const EdgeInsets.all(JSpace.s16),
                children: [
                  for (var i = 0; i < 3; i++) ...[if (i > 0) const SizedBox(height: JSpace.s12), const JSkeletonRow()],
                ],
              ),
              error: (e, _) => Center(
                child: JEmptyState(
                  kind: JEmptyStateKind.error,
                  title: l10n.addrLoadError,
                  body: l10n.addrLoadErrorBody,
                  actionLabel: l10n.retry,
                  onAction: () => ref.invalidate(addressesProvider),
                ),
              ),
              data: (items) => items.isEmpty
                  ? Center(
                      child: _EmptyAddresses(onAdd: () => addAddress(context, ref)),
                    )
                  : _List(items: items),
            ),
          ),
        ],
      ),
    );
  }
}

/// Map first (out-of-coverage points may be saved, flagged), then the form.
Future<void> addAddress(BuildContext context, WidgetRef ref) async {
  final place = await context.push<PickedPlace>(Routes.addAddressMap);
  if (place == null || !context.mounted) return;
  await context.push(Routes.addressNew, extra: place);
  if (context.mounted) ref.invalidate(addressesProvider);
}

/// Figma's empty state uses the map-pin icon, which is not one of JEmptyState's kinds.
class _EmptyAddresses extends StatelessWidget {
  const _EmptyAddresses({required this.onAdd});

  final VoidCallback onAdd;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return SizedBox(
      width: 342,
      child: Padding(
        padding: const EdgeInsets.all(JSpace.s24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 88,
              height: 88,
              decoration: const BoxDecoration(color: JColors.sand, shape: BoxShape.circle),
              child: const Icon(JIcons.mapPin, size: 40, color: JColors.ink2),
            ),
            const SizedBox(height: JSpace.s12),
            Text(l10n.addrEmptyTitle, style: JText.h2, textAlign: TextAlign.center),
            const SizedBox(height: JSpace.s12),
            Text(
              l10n.addrEmptyBody,
              style: JText.bodyM.copyWith(color: JColors.ink2),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: JSpace.s12),
            JButton(label: l10n.addrAddShort, variant: JButtonVariant.secondary, onPressed: onAdd),
          ],
        ),
      ),
    );
  }
}

class _List extends ConsumerWidget {
  const _List({required this.items});

  final List<Address> items;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    return CustomScrollView(
      slivers: [
        SliverPadding(
          padding: const EdgeInsetsDirectional.fromSTEB(JSpace.s16, JSpace.s16, JSpace.s16, 0),
          sliver: SliverList.separated(
            itemCount: items.length,
            separatorBuilder: (_, _) => const SizedBox(height: JSpace.s16),
            itemBuilder: (context, i) => _AddressCard(item: items[i]),
          ),
        ),
        SliverFillRemaining(
          hasScrollBody: false,
          child: Padding(
            padding: const EdgeInsets.all(JSpace.s16),
            child: Column(
              children: [
                const Spacer(),
                JButton(label: l10n.addrAdd, expand: true, onPressed: () => addAddress(context, ref)),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _AddressCard extends ConsumerWidget {
  const _AddressCard({required this.item});

  final Address item;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final a = item;
    // A locked address opens read-only, with the explanation and disabled save/delete.
    Future<void> edit() async {
      await context.push(Routes.addressEdit, extra: a);
      if (context.mounted) ref.invalidate(addressesProvider);
    }

    return Semantics(
      button: true,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: edit,
        child: Container(
          padding: const EdgeInsets.all(JSpace.s16),
          decoration: BoxDecoration(
            color: JColors.paper,
            border: Border.all(color: JColors.line),
            borderRadius: BorderRadius.circular(JRadius.md),
          ),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: const BoxDecoration(color: JColors.sand, shape: BoxShape.circle),
                child: const Icon(JIcons.mapPin, size: 24, color: JColors.ink),
              ),
              const SizedBox(width: JSpace.s12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Wrap(
                      spacing: JSpace.s8,
                      runSpacing: JSpace.s4,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        Text(a.label, style: JText.h3),
                        if (a.isDefault) JBadge(label: l10n.addrDefault, type: JBadgeType.success, size: JBadgeSize.s),
                        if (!a.covered)
                          JBadge(label: l10n.addrOutOfCoverage, type: JBadgeType.warning, size: JBadgeSize.s),
                      ],
                    ),
                    const SizedBox(height: JSpace.s4),
                    Text(a.line(l10n.listSeparator), style: JText.bodyM.copyWith(color: JColors.ink2)),
                  ],
                ),
              ),
              const SizedBox(width: JSpace.s12),
              // Locked: the lock replaces the edit icon; tapping explains why it cannot change.
              Semantics(
                label: a.locked ? l10n.addrLockedLabel : l10n.addrEdit,
                child: SizedBox(
                  width: 44,
                  height: 44,
                  child: Icon(
                    a.locked ? JIcons.lockSimple : JIcons.pencilSimple,
                    size: 20,
                    color: a.locked ? JColors.mutedSoft : JColors.ink2,
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
