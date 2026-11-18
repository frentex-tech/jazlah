import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/location/presentation/choose_location.dart';
import 'package:jazlah/features/location/presentation/location_providers.dart';
import 'package:jazlah/features/location/presentation/map_picker_screen.dart';
import 'package:jazlah/l10n/app_localizations.dart';

/// shortcut: home until its task lands: the location header (LOC-MOB-1) over a "coming soon" panel.
/// Asks for a location once per session while none is set.
class HomeTab extends ConsumerStatefulWidget {
  const HomeTab({super.key});

  @override
  ConsumerState<HomeTab> createState() => _HomeTabState();
}

/// The automatic prompt runs once per app session, not on every return to the tab.
bool _askedThisSession = false;

class _HomeTabState extends ConsumerState<HomeTab> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted || _askedThisSession || ref.read(selectedLocationProvider) != null) return;
      _askedThisSession = true;
      unawaited(chooseLocation(context, ref));
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final location = ref.watch(selectedLocationProvider);
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
          ),
          // Outside every zone the app still browses; pickup replaces delivery.
          if (location != null && !location.covered)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: JSpace.s16),
              child: LocationBanner(text: l10n.locHomeOutOfCoverage),
            ),
          Expanded(
            child: Center(
              child: JEmptyState(
                kind: JEmptyStateKind.search,
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
