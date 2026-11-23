import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/flutter_svg.dart';

import 'package:jazlah/app/locale.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/l10n/app_localizations.dart';

/// Figma draws a 44px status bar inside every screen; on a device that space is the real safe area.
const double figmaStatusBar = 44;

/// The dark hero of the sign-in screens (Login/Phone, OTP, Profile): brand-deep, bottom radius 26,
/// an optional nav row (back button) and the gold logo centered in the rest.
/// [height] is Figma's height without the 44px status bar.
class AuthHero extends StatelessWidget {
  const AuthHero({
    required this.height,
    required this.emblemSize,
    this.onBack,
    this.onBackOverlay,
    this.showLanguage = false,
    super.key,
  });

  final double height;
  final Size emblemSize;
  final VoidCallback? onBack;

  /// A back button over the hero without a nav row (Login/Phone has none in Figma). It sits at the
  /// start, opposite the language pill; shown only when the screen was pushed (a guest signing in).
  final VoidCallback? onBackOverlay;
  final bool showLanguage;

  @override
  Widget build(BuildContext context) {
    final top = MediaQuery.paddingOf(context).top;
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Container(
        height: height + top,
        decoration: const BoxDecoration(
          color: JColors.brandDeep,
          borderRadius: BorderRadius.vertical(bottom: Radius.circular(JRadius.lg)),
        ),
        child: Stack(
          children: [
            Padding(
              padding: EdgeInsets.only(top: top),
              child: Column(
                children: [
                  if (onBack != null)
                    Padding(
                      padding: const EdgeInsetsDirectional.fromSTEB(JSpace.s16, 4, JSpace.s16, 4),
                      child: Align(
                        alignment: AlignmentDirectional.centerEnd,
                        child: HeroBackButton(onTap: onBack!),
                      ),
                    ),
                  Expanded(
                    child: Center(
                      child: SvgPicture.asset(
                        'assets/images/logo-jazla.svg',
                        width: emblemSize.width,
                        height: emblemSize.height,
                        excludeFromSemantics: true,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            if (showLanguage)
              PositionedDirectional(top: top + 11, end: JSpace.s16, child: const LanguagePill(onDark: true)),
            if (onBackOverlay != null)
              PositionedDirectional(
                top: top + 4,
                start: JSpace.s16,
                child: HeroBackButton(onTap: onBackOverlay!),
              ),
          ],
        ),
      ),
    );
  }
}

/// 44px paper circle with the caret (Figma `back` in the hero nav). Points to the end side.
class HeroBackButton extends StatelessWidget {
  const HeroBackButton({required this.onTap, super.key});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final rtl = Directionality.of(context) == TextDirection.rtl;
    return Semantics(
      button: true,
      label: AppLocalizations.of(context).back,
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          width: 44,
          height: 44,
          decoration: const BoxDecoration(color: JColors.paper, shape: BoxShape.circle),
          child: Icon(rtl ? JIcons.caretRight : JIcons.caretLeft, size: 20, color: JColors.ink),
        ),
      ),
    );
  }
}

/// The «EN English» / «ع العربية» pill that switches the app language at once.
class LanguagePill extends ConsumerWidget {
  const LanguagePill({required this.onDark, super.key});

  final bool onDark;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final current = Localizations.localeOf(context).languageCode;
    return Semantics(
      button: true,
      child: GestureDetector(
        onTap: () => ref.read(localeProvider.notifier).set(current == 'ar' ? 'en' : 'ar'),
        child: Container(
          padding: const EdgeInsetsDirectional.fromSTEB(12, 7, 12, 7),
          decoration: BoxDecoration(
            // Figma: #FFFAF7 at 16% on the dark hero; paper with a line stroke on light screens.
            color: onDark ? const Color(0x29FFFAF7) : JColors.paper,
            borderRadius: BorderRadius.circular(JRadius.pill),
            border: onDark ? null : Border.all(color: JColors.line),
          ),
          // Figma keeps «EN English» in this order in Arabic too: the pill does not mirror.
          child: Row(
            textDirection: TextDirection.ltr,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                l10n.otherLanguageCode,
                style: JText.raw(10, FontWeight.w700, color: onDark ? JColors.goldLight : JColors.goldText),
              ),
              const SizedBox(width: 6),
              Text(
                l10n.otherLanguageName,
                style: JText.raw(12, FontWeight.w500, color: onDark ? JColors.paper : JColors.ink),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Three reassurance points (verified stores, fresh, same-day delivery): 52px sand rings, 26px brand icons.
class TrustRow extends StatelessWidget {
  const TrustRow({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    // Figma: 104-wide points spaced between; a long label wraps to two lines at Label/M (never scales).
    Widget point(IconData icon, String label) => Flexible(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 104, minWidth: 104),
        child: Column(
          children: [
            Container(
              width: 52,
              height: 52,
              decoration: const BoxDecoration(color: JColors.sand, shape: BoxShape.circle),
              child: Icon(icon, size: 26, color: JColors.brand),
            ),
            const SizedBox(height: JSpace.s8),
            Text(label, style: JText.labelM, maxLines: 2, textAlign: TextAlign.center),
          ],
        ),
      ),
    );
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        point(JIcons.truck, l10n.trustDelivery),
        point(JIcons.thermometer, l10n.trustFresh),
        point(JIcons.sealCheck, l10n.trustVerified),
      ],
    );
  }
}

/// Title (H1) and subtitle (Body/M, ink-2) with an 8px gap.
class TitleBlock extends StatelessWidget {
  const TitleBlock({required this.title, required this.subtitle, super.key});

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(title, style: JText.h1),
        const SizedBox(height: JSpace.s8),
        Text(subtitle, style: JText.bodyM.copyWith(color: JColors.ink2)),
      ],
    );
  }
}

/// The body under a hero: padding 24, gap 16, the last child pinned to the bottom
/// (Figma `spacer` fill), scrolling when the keyboard needs the room.
class PinnedBottomBody extends StatelessWidget {
  const PinnedBottomBody({required this.children, required this.bottom, super.key});

  final List<Widget> children;
  final Widget bottom;

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      slivers: [
        SliverFillRemaining(
          hasScrollBody: false,
          child: Padding(
            padding: EdgeInsets.fromLTRB(
              JSpace.s24,
              JSpace.s24,
              JSpace.s24,
              JSpace.s24 + MediaQuery.paddingOf(context).bottom,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                for (final (i, w) in children.indexed) ...[if (i > 0) const SizedBox(height: JSpace.s16), w],
                const Spacer(),
                const SizedBox(height: JSpace.s16),
                bottom,
              ],
            ),
          ),
        ),
      ],
    );
  }
}
