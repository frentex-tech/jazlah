import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/flutter_svg.dart';

import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/auth/presentation/onboarding_controller.dart';
import 'package:jazlah/features/auth/presentation/session_controller.dart';
import 'package:jazlah/features/auth/presentation/widgets/auth_parts.dart';
import 'package:jazlah/l10n/app_localizations.dart';

/// Onboarding slides 1–3 (Figma 199-28039, 123-2588, 123-2651). With [loading] it is the
/// start-up state while the stored session is read (Figma 123-2712).
/// «Skip» browses as a guest; «Get started» on the last slide signs in.
class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({this.loading = false, super.key});

  final bool loading;

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  final _pages = PageController();
  int _page = 0;

  static const _photos = ['assets/images/steaks-dark.jpg', 'assets/images/butchers.jpg', 'assets/images/lamb-raw.jpg'];

  @override
  void dispose() {
    _pages.dispose();
    super.dispose();
  }

  Future<void> _finish({required bool guest}) async {
    final session = ref.read(sessionProvider.notifier);
    guest ? session.continueAsGuest() : session.startSignIn();
    await ref.read(onboardingSeenProvider.notifier).markSeen();
  }

  void _next() => _page == 2
      ? _finish(guest: false)
      : _pages.nextPage(duration: const Duration(milliseconds: 300), curve: Curves.easeOut);

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final slides = [
      (l10n.onboardingTitle1, l10n.onboardingBody1),
      (l10n.onboardingTitle2, l10n.onboardingBody2),
      (l10n.onboardingTitle3, l10n.onboardingBody3),
    ];
    final top = MediaQuery.paddingOf(context).top;
    final bottom = MediaQuery.paddingOf(context).bottom;
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.dark,
      child: Scaffold(
        body: Stack(
          children: [
            Padding(
              padding: EdgeInsets.fromLTRB(JSpace.s24, top + JSpace.s24, JSpace.s24, JSpace.s24 + bottom),
              child: widget.loading ? const _Loading() : _slides(slides, l10n),
            ),
            PositionedDirectional(top: top + 15, start: JSpace.s16, child: const LanguagePill(onDark: false)),
          ],
        ),
      ),
    );
  }

  Widget _slides(List<(String, String)> slides, AppLocalizations l10n) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // The logo sits at the end of the brand row, opposite the language pill.
        Align(
          alignment: AlignmentDirectional.centerEnd,
          child: SvgPicture.asset('assets/images/logo-jazla-on-light.svg', width: 61, height: 60),
        ),
        const SizedBox(height: JSpace.s16),
        Expanded(
          child: PageView.builder(
            controller: _pages,
            itemCount: 3,
            onPageChanged: (i) => setState(() => _page = i),
            itemBuilder: (context, i) => ClipRRect(
              borderRadius: BorderRadius.circular(JRadius.lg),
              child: Image.asset(_photos[i], fit: BoxFit.cover, excludeFromSemantics: true),
            ),
          ),
        ),
        const SizedBox(height: JSpace.s16),
        // Figma's dots run left to right in both languages, at the start of the row.
        Align(
          alignment: AlignmentDirectional.centerStart,
          child: Row(
            textDirection: TextDirection.ltr,
            mainAxisSize: MainAxisSize.min,
            children: [
              for (var i = 0; i < 3; i++) ...[
                if (i > 0) const SizedBox(width: JSpace.s8),
                AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  width: i == _page ? 28 : 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: i == _page ? JColors.ember : JColors.line,
                    borderRadius: BorderRadius.circular(JRadius.pill),
                  ),
                ),
              ],
            ],
          ),
        ),
        const SizedBox(height: JSpace.s16),
        TitleBlock(title: slides[_page].$1, subtitle: slides[_page].$2),
        const SizedBox(height: JSpace.s16),
        JButton(label: _page == 2 ? l10n.onboardingStart : l10n.onboardingNext, onPressed: _next, expand: true),
        // The last slide has no skip; its photo takes the room (Figma 123-2651).
        if (_page < 2) ...[
          const SizedBox(height: JSpace.s16),
          JButton(
            label: l10n.onboardingSkip,
            onPressed: () => _finish(guest: true),
            variant: JButtonVariant.ghost,
            expand: true,
          ),
        ],
      ],
    );
  }
}

class _Loading extends StatelessWidget {
  const _Loading();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Container(
          height: 380,
          decoration: BoxDecoration(color: JColors.sand, borderRadius: BorderRadius.circular(JRadius.lg)),
        ),
        const SizedBox(height: JSpace.s16),
        const JSkeletonRow(),
        const SizedBox(height: JSpace.s12),
        const JSkeletonRow(),
      ],
    );
  }
}
