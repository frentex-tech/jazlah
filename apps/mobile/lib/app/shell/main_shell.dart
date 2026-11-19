import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'package:jazlah/app/router/router.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/l10n/app_localizations.dart';

enum MainTab { home, services, orders, account }

/// The four tabs (Figma `Bottom tab bar`, home at the start). Home, services and orders
/// are placeholders until their tasks land.
class MainShell extends StatelessWidget {
  const MainShell({required this.location, required this.child, super.key});

  final String location;
  final Widget child;

  static const List<String> _paths = [Routes.home, Routes.services, Routes.orders, Routes.account];

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final active = _paths.lastIndexWhere(location.startsWith).clamp(0, 3);
    return Scaffold(
      body: child,
      bottomNavigationBar: JBottomTabBar(
        activeIndex: active,
        onTap: (i) => context.go(_paths[i]),
        items: [
          JBottomTabItem(icon: JIcons.house, activeIcon: JIcons.houseFill, label: l10n.tabHome),
          JBottomTabItem(icon: JIcons.squaresFour, activeIcon: JIcons.squaresFourFill, label: l10n.tabServices),
          JBottomTabItem(icon: JIcons.receipt, activeIcon: JIcons.receiptFill, label: l10n.tabOrders),
          JBottomTabItem(icon: JIcons.user, activeIcon: JIcons.userFill, label: l10n.tabAccount),
        ],
      ),
    );
  }
}

/// shortcut: a "coming soon" panel for tabs whose screens belong to later tasks: home STF-MOB-1 (#55),
/// services OCC-MOB-1 (#124), orders ORD-MOB-2 (#85).
class PlaceholderTab extends StatelessWidget {
  const PlaceholderTab({required this.tab, super.key});

  final MainTab tab;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final title = switch (tab) {
      MainTab.home => l10n.tabHome,
      MainTab.services => l10n.tabServices,
      MainTab.orders => l10n.tabOrders,
      MainTab.account => l10n.tabAccount,
    };
    return SafeArea(
      bottom: false,
      child: Column(
        children: [
          JAppHeader.page(title: title, cartLabel: l10n.cart),
          Expanded(
            child: Center(
              child: JEmptyState(
                kind: tab == MainTab.orders ? JEmptyStateKind.orders : JEmptyStateKind.search,
                title: l10n.comingSoonTitle,
                body: l10n.comingSoonBody,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
