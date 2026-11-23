import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:jazlah/app/router/router.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/core/errors/error_text.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/auth/domain/otp_challenge.dart';
import 'package:jazlah/features/auth/presentation/session_controller.dart';
import 'package:jazlah/features/auth/presentation/widgets/auth_parts.dart';
import 'package:jazlah/l10n/app_localizations.dart';

/// Login/Phone (Figma 123-2794 default, 123-3110 filled, 123-2879 error, 123-2994 loading).
class PhoneScreen extends ConsumerStatefulWidget {
  const PhoneScreen({super.key});

  @override
  ConsumerState<PhoneScreen> createState() => _PhoneScreenState();
}

class _PhoneScreenState extends ConsumerState<PhoneScreen> {
  final _controller = TextEditingController();
  String _digits = '';
  bool _invalid = false;
  bool _loading = false;

  /// RATE_LIMITED: no new code before Retry-After (errors.md, "Wait").
  Timer? _wait;

  @override
  void dispose() {
    _wait?.cancel();
    _controller.dispose();
    super.dispose();
  }

  void _onChanged(String digits) => setState(() {
    _digits = digits;
    // A full number that is not a Saudi mobile is wrong at once; a short one only when submitted.
    _invalid = digits.length == 9 && !isValidSaudiMobile(digits);
  });

  Future<void> _submit() async {
    if (!isValidSaudiMobile(_digits)) return setState(() => _invalid = true);
    setState(() => _loading = true);
    try {
      final challenge = await ref.read(authRepositoryProvider).requestCode(_digits);
      if (!mounted) return;
      final from = safeNext(GoRouterState.of(context).uri.queryParameters['from']);
      await context.push(
        from == null ? Routes.otp : '${Routes.otp}?from=${Uri.encodeComponent(from)}',
        extra: challenge,
      );
    } on ApiError catch (e) {
      if (!mounted) return;
      if (e.code == 'VALIDATION_FAILED' && e.invalidFields.contains('phone')) {
        setState(() => _invalid = true);
      } else {
        if (e.retryAfter != null) {
          setState(() => _wait = Timer(e.retryAfter!, () => setState(() => _wait = null)));
        }
        showJToast(context, message: errorText(context, e), kind: JToastKind.error);
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final valid = isValidSaudiMobile(_digits);
    return Scaffold(
      body: Column(
        children: [
          // A guest who chose to sign in can go back to browsing.
          AuthHero(
            height: 256,
            emblemSize: const Size(153, 150),
            showLanguage: true,
            onBackOverlay: context.canPop() ? () => context.pop() : null,
          ),
          Expanded(
            child: PinnedBottomBody(
              bottom: JButton(
                label: l10n.sendCode,
                onPressed: (valid || _loading) && _wait == null ? _submit : null,
                loading: _loading,
                expand: true,
              ),
              children: [
                TitleBlock(title: l10n.phoneTitle, subtitle: l10n.phoneSubtitle),
                JPhoneField(
                  controller: _controller,
                  label: l10n.phoneLabel,
                  helperText: l10n.phoneHint,
                  errorText: _invalid ? l10n.phoneInvalid : null,
                  onChanged: _onChanged,
                  onSubmitted: (_) => _submit(),
                ),
                const TrustRow(),
                // Figma shows the terms line only in the empty default state.
                if (_controller.text.isEmpty && !_invalid && !_loading)
                  Text(l10n.termsNotice, style: JText.bodyM.copyWith(color: JColors.ink2)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
