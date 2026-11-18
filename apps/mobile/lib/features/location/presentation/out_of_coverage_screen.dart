import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/location/domain/location.dart';
import 'package:jazlah/features/location/presentation/location_providers.dart';
import 'package:jazlah/l10n/app_localizations.dart';

enum OutOfCoverageChoice { change, pickup, covered }

/// Location/OutOfCoverage (Figma 86-3823 default, 86-3864 loading, 86-3907 error).
/// Checks [point] again and lists the served cities. «Browse and pick up» is not in Figma: it is the
/// pickup suggestion LOC-MOB-1 asks for, so the customer is never stuck outside a zone.
class OutOfCoverageScreen extends ConsumerStatefulWidget {
  const OutOfCoverageScreen({required this.point, super.key});

  final GeoPoint point;

  @override
  ConsumerState<OutOfCoverageScreen> createState() => _OutOfCoverageScreenState();
}

class _OutOfCoverageScreenState extends ConsumerState<OutOfCoverageScreen> {
  late Future<List<String>> _check = _run();

  Future<List<String>> _run() async {
    final repo = ref.read(coverageRepositoryProvider);
    final coverage = await repo.check(widget.point);
    if (coverage.covered && mounted) context.pop(OutOfCoverageChoice.covered);
    if (!mounted) return const [];
    return repo.cities(Localizations.localeOf(context).languageCode);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            JAppHeader.page(title: l10n.locOutScreenTitle, cartLabel: l10n.cart, onBack: () => context.pop()),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(JSpace.s16),
                child: FutureBuilder(
                  future: _check,
                  builder: (context, snap) {
                    if (snap.hasError) {
                      return Center(
                        child: JEmptyState(
                          kind: JEmptyStateKind.error,
                          title: l10n.locOutErrorTitle,
                          body: l10n.locOutErrorBody,
                          actionLabel: l10n.retry,
                          onAction: () => setState(() => _check = _run()),
                        ),
                      );
                    }
                    if (!snap.hasData) {
                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Text(l10n.locOutChecking, style: JText.bodyM.copyWith(color: JColors.ink2)),
                          const SizedBox(height: JSpace.s16),
                          const JSkeletonRow(),
                          const SizedBox(height: JSpace.s12),
                          const JSkeletonRow(),
                        ],
                      );
                    }
                    return Column(
                      children: [
                        const Spacer(),
                        _panel(l10n),
                        const Spacer(),
                        Text(
                          l10n.locOutCities(snap.data!.join(l10n.listSeparator)),
                          style: JText.bodyM.copyWith(color: JColors.ink2),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    );
                  },
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Figma `State panel` with the folded-map icon (not one of JEmptyState's kinds).
  Widget _panel(AppLocalizations l10n) {
    return SizedBox(
      width: 342,
      child: Padding(
        padding: const EdgeInsets.all(JSpace.s24),
        child: Column(
          children: [
            Container(
              width: 88,
              height: 88,
              decoration: const BoxDecoration(color: JColors.sand, shape: BoxShape.circle),
              child: const Icon(JIcons.mapTrifold, size: 40, color: JColors.ink2),
            ),
            const SizedBox(height: JSpace.s12),
            Text(l10n.locOutTitle, style: JText.h2, textAlign: TextAlign.center),
            const SizedBox(height: JSpace.s12),
            Text(
              l10n.locOutBody,
              style: JText.bodyM.copyWith(color: JColors.ink2),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: JSpace.s12),
            JButton(
              label: l10n.locOutChange,
              variant: JButtonVariant.secondary,
              onPressed: () => context.pop(OutOfCoverageChoice.change),
            ),
            const SizedBox(height: JSpace.s8),
            JButton(
              label: l10n.locOutPickup,
              variant: JButtonVariant.ghost,
              size: JButtonSize.s,
              onPressed: () => context.pop(OutOfCoverageChoice.pickup),
            ),
          ],
        ),
      ),
    );
  }
}
