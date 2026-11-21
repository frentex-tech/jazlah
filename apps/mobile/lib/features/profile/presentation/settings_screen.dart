import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:jazlah/app/locale.dart';
import 'package:jazlah/app/providers.dart';
import 'package:jazlah/app/router/router.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/core/errors/error_text.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/auth/presentation/session_controller.dart';
import 'package:jazlah/features/profile/domain/customer_profile.dart';
import 'package:jazlah/features/profile/presentation/profile_providers.dart';
import 'package:jazlah/l10n/app_localizations.dart';

/// Settings (Figma 86-8608 default, 86-8667 delete confirm, 86-8735 loading, 86-8791 error).
class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final profile = ref.watch(profileProvider);
    return SafeArea(
      bottom: false,
      child: Column(
        children: [
          JAppHeader.page(title: l10n.settingsTitle, cartLabel: l10n.cart, onBack: () => context.go(Routes.account)),
          Expanded(
            child: profile.when(
              loading: () => ListView(
                padding: const EdgeInsets.all(JSpace.s16),
                children: [
                  for (var i = 0; i < 4; i++) ...[if (i > 0) const SizedBox(height: JSpace.s12), const JSkeletonRow()],
                ],
              ),
              error: (e, _) => Center(
                child: JEmptyState(
                  kind: JEmptyStateKind.error,
                  title: l10n.settingsLoadError,
                  body: l10n.checkConnection,
                  actionLabel: l10n.retry,
                  onAction: () => ref.invalidate(profileProvider),
                ),
              ),
              data: (p) => _SettingsBody(profile: p),
            ),
          ),
        ],
      ),
    );
  }
}

class _SettingsBody extends ConsumerStatefulWidget {
  const _SettingsBody({required this.profile});

  final CustomerProfile profile;

  @override
  ConsumerState<_SettingsBody> createState() => _SettingsBodyState();
}

class _SettingsBodyState extends ConsumerState<_SettingsBody> {
  static const _orderNotificationsKey = 'notify.orders';
  late bool _offers = widget.profile.marketingConsent;
  bool _busy = false;
  bool _signingOut = false;

  Future<void> _signOut() async {
    setState(() => _busy = _signingOut = true);
    await ref.read(sessionProvider.notifier).signOut();
  }

  Future<void> _setLanguage(String code) async {
    await ref.read(localeProvider.notifier).set(code);
    // The API uses it for SMS and messages; the app already switched, so a failure here is not shown.
    ref.read(profileRepositoryProvider).update(preferredLanguage: code).ignore();
  }

  Future<void> _setOffers(bool granted) async {
    setState(() => _offers = granted);
    try {
      await ref.read(profileRepositoryProvider).setMarketingConsent(granted: granted);
    } on ApiError catch (e) {
      if (!mounted) return;
      setState(() => _offers = !granted);
      showJToast(context, message: errorText(context, e), kind: JToastKind.error);
    }
  }

  Future<void> _delete() async {
    final l10n = AppLocalizations.of(context);
    final confirmed = await showJDialog(
      context,
      title: l10n.deleteAccountTitle,
      body: l10n.deleteAccountBody,
      confirmLabel: l10n.deleteAccount,
      cancelLabel: l10n.cancel,
      type: JDialogType.destructiveText,
    );
    if (confirmed != true || !mounted) return;
    // Second step: the optional reason, then the final, irreversible button.
    final reason = await showJBottomSheet<(DeleteReason?,)>(
      context,
      title: l10n.deleteReasonTitle,
      builder: (_) => const _DeleteReasonSheet(),
    );
    if (reason == null || !mounted) return;
    await _runDelete(reason.$1);
  }

  Future<void> _runDelete(DeleteReason? reason) async {
    final repo = ref.read(profileRepositoryProvider);
    setState(() => _busy = true);
    try {
      await repo.deleteAccount(reason);
      await ref.read(sessionProvider.notifier).accountDeleted();
    } on ApiError catch (e) {
      if (!mounted) return;
      if (e.code == 'RECENT_SIGN_IN_REQUIRED') {
        // Not a refresh: a new code by SMS, then the same deletion again (docs/frontend/auth.md).
        final phone = widget.profile.phone.replaceAll(RegExp(r'\D'), '').substring(3);
        try {
          final challenge = await ref.read(authRepositoryProvider).requestCode(phone);
          if (!mounted) return;
          final ok = await context.push<bool>(Routes.reauth, extra: challenge);
          if (ok == true && mounted) return _runDelete(reason);
        } on ApiError catch (e2) {
          if (mounted) showJToast(context, message: errorText(context, e2), kind: JToastKind.error);
        }
      } else {
        showJToast(context, message: errorText(context, e), kind: JToastKind.error);
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final lang = Localizations.localeOf(context).languageCode;
    final prefs = ref.watch(prefsProvider);
    final orders = prefs.getString(_orderNotificationsKey) != 'off';
    Widget group(String title, List<Widget> children) => Container(
      padding: const EdgeInsets.all(JSpace.s16),
      decoration: BoxDecoration(
        color: JColors.paper,
        border: Border.all(color: JColors.line),
        borderRadius: BorderRadius.circular(JRadius.md),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: double.infinity,
            child: Text(title, style: JText.h3),
          ),
          for (final c in children) ...[const SizedBox(height: JSpace.s12), c],
        ],
      ),
    );
    return CustomScrollView(
      slivers: [
        SliverFillRemaining(
          hasScrollBody: false,
          child: Padding(
            padding: const EdgeInsets.all(JSpace.s16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                group(l10n.settingsLanguage, [
                  Row(
                    children: [
                      JChip(label: 'العربية', selected: lang == 'ar', onTap: () => _setLanguage('ar')),
                      const SizedBox(width: JSpace.s8),
                      JChip(label: 'English', selected: lang == 'en', onTap: () => _setLanguage('en')),
                    ],
                  ),
                ]),
                const SizedBox(height: JSpace.s16),
                group(l10n.settingsNotifications, [
                  // shortcut: stored on the device until notification settings have an API: NOT-MOB-1 (#105), API gap.
                  JSwitch(
                    checked: orders,
                    label: l10n.settingsOrderNotifications,
                    onChanged: (v) async {
                      await prefs.setString(_orderNotificationsKey, v ? 'on' : 'off');
                      setState(() {});
                    },
                  ),
                  JSwitch(checked: _offers, label: l10n.settingsOffers, onChanged: _setOffers),
                ]),
                const Spacer(),
                const SizedBox(height: JSpace.s16),
                JButton(
                  label: l10n.signOut,
                  onPressed: _busy ? null : _signOut,
                  loading: _signingOut,
                  variant: JButtonVariant.secondary,
                  expand: true,
                ),
                const SizedBox(height: JSpace.s16),
                Semantics(
                  button: true,
                  child: GestureDetector(
                    behavior: HitTestBehavior.opaque,
                    onTap: _busy ? null : _delete,
                    child: Container(
                      height: 36,
                      alignment: Alignment.center,
                      child: _busy
                          ? const SizedBox.square(
                              dimension: 16,
                              child: CircularProgressIndicator(strokeWidth: 2, color: JColors.danger),
                            )
                          : Text(
                              l10n.deleteAccount,
                              style: JText.raw(13, FontWeight.w500, color: JColors.danger).copyWith(height: 1.5),
                            ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _DeleteReasonSheet extends StatefulWidget {
  const _DeleteReasonSheet();

  @override
  State<_DeleteReasonSheet> createState() => _DeleteReasonSheetState();
}

class _DeleteReasonSheetState extends State<_DeleteReasonSheet> {
  DeleteReason? _reason;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final labels = {
      DeleteReason.notUsing: l10n.deleteReasonNotUsing,
      DeleteReason.privacy: l10n.deleteReasonPrivacy,
      DeleteReason.badExperience: l10n.deleteReasonBadExperience,
      DeleteReason.otherAccount: l10n.deleteReasonOtherAccount,
      DeleteReason.other: l10n.deleteReasonOther,
    };
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(l10n.deleteReasonHint, style: JText.bodyM.copyWith(color: JColors.ink2)),
        const SizedBox(height: JSpace.s8),
        for (final r in DeleteReason.values)
          Align(
            alignment: AlignmentDirectional.centerStart,
            child: JRadio(checked: _reason == r, label: labels[r], onTap: () => setState(() => _reason = r)),
          ),
        const SizedBox(height: JSpace.s16),
        JButton(
          label: l10n.deleteAccountForever,
          variant: JButtonVariant.danger,
          expand: true,
          onPressed: () => Navigator.of(context).pop((_reason,)),
        ),
      ],
    );
  }
}
