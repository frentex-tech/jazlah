import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:jazlah/app/router/router.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/addresses/presentation/address_providers.dart';
import 'package:jazlah/features/auth/presentation/session_controller.dart';
import 'package:jazlah/features/orders/presentation/orders_providers.dart';
import 'package:jazlah/features/profile/domain/customer_profile.dart';
import 'package:jazlah/features/profile/presentation/profile_providers.dart';
import 'package:jazlah/l10n/app_localizations.dart';

/// حسابي / Account (Figma 227-44073, English 352-38532). A guest sees a sign-in panel instead.
class AccountScreen extends ConsumerWidget {
  const AccountScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final guest = ref.watch(sessionProvider) != SessionStatus.signedIn;
    return SafeArea(
      bottom: false,
      child: Column(
        children: [
          JAppHeader.page(title: l10n.accountTitle, cartLabel: l10n.cart),
          Expanded(
            child: guest
                ? Center(
                    child: JEmptyState(
                      kind: JEmptyStateKind.denied,
                      title: l10n.guestTitle,
                      body: l10n.guestBody,
                      actionLabel: l10n.signIn,
                      onAction: () => context.push(Routes.phone),
                    ),
                  )
                : const _AccountBody(),
          ),
        ],
      ),
    );
  }
}

class _AccountBody extends ConsumerWidget {
  const _AccountBody();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final profile = ref.watch(profileProvider);
    return profile.when(
      loading: () => ListView(
        padding: const EdgeInsets.all(JSpace.s16),
        children: [
          for (var i = 0; i < 4; i++) ...[if (i > 0) const SizedBox(height: JSpace.s12), const JSkeletonRow()],
        ],
      ),
      error: (e, _) => Center(
        child: JEmptyState(
          kind: JEmptyStateKind.error,
          title: l10n.errorGeneric,
          body: l10n.checkConnection,
          actionLabel: l10n.retry,
          onAction: () => ref.invalidate(profileProvider),
        ),
      ),
      data: (p) => _content(context, ref, l10n, p),
    );
  }

  Widget _content(BuildContext context, WidgetRef ref, AppLocalizations l10n, CustomerProfile p) {
    final language = Localizations.localeOf(context).languageCode == 'ar' ? 'العربية' : 'English';
    return ListView(
      padding: const EdgeInsets.all(JSpace.s16),
      children: [
        _ProfileCard(profile: p, onEdit: () => context.push(Routes.editProfile)),
        const SizedBox(height: JSpace.s16),
        // shortcut: animals and listings (FED-MOB-1, #152) show "—" until their counters exist (API gap,
        // not-built-yet.md); orders count the order list (ORD-MOB-2 #85; "—" without the orders route).
        Row(
          children: [
            _Stat(value: ref.watch(ordersProvider(null)).value?.length, label: l10n.statOrders),
            const SizedBox(width: 10),
            _Stat(value: ref.watch(addressesProvider).value?.length, label: l10n.statAddresses),
            const SizedBox(width: 10),
            _Stat(value: null, label: l10n.statAnimals),
            const SizedBox(width: 10),
            _Stat(value: null, label: l10n.statListings),
          ],
        ),
        const SizedBox(height: JSpace.s16),
        _MenuGroup(
          items: [
            _MenuItem(icon: JIcons.receipt, label: l10n.menuOrders, onTap: () => context.go(Routes.orders)),
            _MenuItem(icon: JIcons.mapPin, label: l10n.menuAddresses, onTap: () => context.go(Routes.addresses)),
            _MenuItem(icon: JIcons.pawPrint, label: l10n.menuAnimals),
            _MenuItem(icon: JIcons.storefront, label: l10n.menuFeedListings),
            // No points balance until loyalty lands: no made-up "0".
            _MenuItem(icon: JIcons.starFill, label: l10n.menuPoints),
            _MenuItem(icon: JIcons.camera, label: l10n.menuStories),
            _MenuItem(icon: JIcons.pawPrint, label: l10n.menuCharity),
          ],
        ),
        const SizedBox(height: JSpace.s16),
        _MenuGroup(
          items: [
            _MenuItem(icon: JIcons.bell, label: l10n.menuNotifications),
            _MenuItem(
              icon: JIcons.gear,
              label: l10n.menuSettings,
              trailing: language,
              onTap: () => context.go(Routes.settings),
            ),
            _MenuItem(icon: JIcons.chatCircleText, label: l10n.menuHelp),
          ],
        ),
        const SizedBox(height: JSpace.s16),
        const _SignOutRow(),
      ],
    );
  }
}

/// «Sign out» under the menus; ignores taps while the request runs.
class _SignOutRow extends ConsumerStatefulWidget {
  const _SignOutRow();

  @override
  ConsumerState<_SignOutRow> createState() => _SignOutRowState();
}

class _SignOutRowState extends ConsumerState<_SignOutRow> {
  bool _busy = false;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Semantics(
      button: true,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: _busy
            ? null
            : () async {
                setState(() => _busy = true);
                await ref.read(sessionProvider.notifier).signOut();
              },
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: JSpace.s8, horizontal: JSpace.s16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(JIcons.signOut, size: 18, color: JColors.danger),
              const SizedBox(width: JSpace.s8),
              Text(l10n.signOut, style: JText.raw(14, FontWeight.w500, color: JColors.danger)),
            ],
          ),
        ),
      ),
    );
  }
}

class _ProfileCard extends StatelessWidget {
  const _ProfileCard({required this.profile, required this.onEdit});

  final CustomerProfile profile;
  final VoidCallback onEdit;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Container(
      padding: const EdgeInsets.all(JSpace.s16),
      decoration: BoxDecoration(color: JColors.brand, borderRadius: BorderRadius.circular(JRadius.md)),
      child: Row(
        children: [
          Container(
            width: 56,
            height: 56,
            alignment: Alignment.center,
            decoration: const BoxDecoration(color: JColors.goldLight, shape: BoxShape.circle),
            child: Text(profile.initials, style: JText.raw(20, FontWeight.w700, color: JColors.brandDeep)),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  profile.fullName ?? '',
                  style: JText.raw(16, FontWeight.w700, color: JColors.paper),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  '‎${profile.displayPhone}',
                  style: JText.raw(12, FontWeight.w400, color: JColors.paper),
                ),
              ],
            ),
          ),
          const SizedBox(width: 14),
          Semantics(
            button: true,
            label: l10n.editProfile,
            child: GestureDetector(
              onTap: onEdit,
              child: Container(
                width: 36,
                height: 36,
                decoration: const BoxDecoration(color: JColors.paper, shape: BoxShape.circle),
                child: const Icon(JIcons.pencilSimple, size: 16, color: JColors.goldLight),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _Stat extends StatelessWidget {
  const _Stat({required this.value, required this.label});

  /// Null: not known yet (no API), shown as "—".
  final int? value;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: JSpace.s12, horizontal: JSpace.s8),
        decoration: BoxDecoration(
          color: JColors.paper,
          border: Border.all(color: JColors.line),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Column(
          children: [
            Text(value?.toString() ?? '—', style: JText.raw(18, FontWeight.w700, color: JColors.ember)),
            const SizedBox(height: 2),
            Text(label, style: JText.raw(11, FontWeight.w400, color: JColors.muted)),
          ],
        ),
      ),
    );
  }
}

class _MenuItem {
  const _MenuItem({required this.icon, required this.label, this.trailing, this.onTap});

  final IconData icon;
  final String label;
  final String? trailing;
  final VoidCallback? onTap;
}

class _MenuGroup extends StatelessWidget {
  const _MenuGroup({required this.items});

  final List<_MenuItem> items;

  @override
  Widget build(BuildContext context) {
    final rtl = Directionality.of(context) == TextDirection.rtl;
    return Container(
      decoration: BoxDecoration(
        color: JColors.paper,
        border: Border.all(color: JColors.line),
        borderRadius: BorderRadius.circular(JRadius.md),
      ),
      child: Column(
        children: [
          for (final (i, item) in items.indexed) ...[
            if (i > 0) const Divider(),
            Semantics(
              button: true,
              child: GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: item.onTap,
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 13, horizontal: JSpace.s16),
                  child: Row(
                    children: [
                      Icon(item.icon, size: 20, color: JColors.ink2),
                      const SizedBox(width: JSpace.s12),
                      Expanded(child: Text(item.label, style: JText.raw(14, FontWeight.w400))),
                      if (item.trailing != null) ...[
                        Text(item.trailing!, style: JText.raw(12, FontWeight.w400, color: JColors.muted)),
                        const SizedBox(width: JSpace.s12),
                      ],
                      Icon(rtl ? JIcons.caretLeft : JIcons.caretRight, size: 14, color: JColors.muted),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
