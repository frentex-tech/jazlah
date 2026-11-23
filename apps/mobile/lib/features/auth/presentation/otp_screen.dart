import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:jazlah/app/router/router.dart';
import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/core/errors/error_text.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/auth/domain/otp_challenge.dart';
import 'package:jazlah/features/auth/presentation/session_controller.dart';
import 'package:jazlah/features/auth/presentation/widgets/auth_parts.dart';
import 'package:jazlah/l10n/app_localizations.dart';

/// Login/OTP (Figma 123-3227 default, 123-3316 filled, 123-3435 error, 123-3555 loading).
/// With [reauth], it confirms a recent sign-in before deleting the account and pops `true`.
class OtpScreen extends ConsumerStatefulWidget {
  const OtpScreen({required this.challenge, this.reauth = false, this.next, super.key});

  final OtpChallenge challenge;
  final bool reauth;

  /// The deep link that led to sign-in, opened afterwards instead of home.
  final String? next;

  @override
  ConsumerState<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends ConsumerState<OtpScreen> {
  final _controller = TextEditingController();
  late OtpChallenge _challenge = widget.challenge;
  Timer? _timer;
  late int _secondsLeft;
  String? _error;
  bool _loading = false;
  bool _resending = false;

  /// RATE_LIMITED on verify: confirm stays off until Retry-After.
  Timer? _wait;

  @override
  void initState() {
    super.initState();
    _startCountdown();
    _controller.addListener(() {
      if (_error != null && _controller.text.length < _challenge.codeLength) setState(() => _error = null);
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _wait?.cancel();
    _controller.dispose();
    super.dispose();
  }

  void _startCountdown() {
    _timer?.cancel();
    _secondsLeft = _challenge.resendAfter.inSeconds;
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      setState(() => _secondsLeft--);
      if (_secondsLeft <= 0) t.cancel();
    });
  }

  String get _clock {
    final s = _secondsLeft.clamp(0, 5999);
    return '${(s ~/ 60).toString().padLeft(2, '0')}:${(s % 60).toString().padLeft(2, '0')}';
  }

  Future<void> _verify() async {
    final code = _controller.text;
    if (code.length != _challenge.codeLength || _loading || _wait != null) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final complete = await ref.read(authRepositoryProvider).verify(_challenge.phone, code);
      if (!mounted) return;
      if (widget.reauth) return context.pop(true);
      unawaited(ref.read(sessionProvider.notifier).signedIn());
      context.go(complete ? (widget.next ?? Routes.home) : Routes.completeProfile);
    } on ApiError catch (e) {
      if (!mounted) return;
      final l10n = AppLocalizations.of(context);
      setState(() {
        _error = switch (e.code) {
          'OTP_INVALID' => l10n.otpInvalid,
          'OTP_EXPIRED' => l10n.otpExpired,
          _ => errorText(context, e),
        };
        if (e.code == 'OTP_EXPIRED') _secondsLeft = 0;
        if (e.retryAfter != null) {
          _wait?.cancel();
          _wait = Timer(e.retryAfter!, () => setState(() => _wait = null));
        }
      });
      // A wrong code stays visible in red (Figma 123-3435) until edited; an expired one is cleared.
      if (e.code == 'OTP_EXPIRED') _controller.clear();
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _resend() async {
    if (_resending) return;
    setState(() => _resending = true);
    try {
      final next = await ref.read(authRepositoryProvider).requestCode(_challenge.phone);
      if (!mounted) return;
      setState(() {
        _challenge = next;
        _error = null;
      });
      _controller.clear();
      _startCountdown();
    } on ApiError catch (e) {
      if (!mounted) return;
      if (e.retryAfter != null) setState(() => _startCountdownFrom(e.retryAfter!));
      showJToast(context, message: errorText(context, e), kind: JToastKind.error);
    } finally {
      if (mounted) setState(() => _resending = false);
    }
  }

  void _startCountdownFrom(Duration wait) {
    _challenge = OtpChallenge(phone: _challenge.phone, resendAfter: wait, codeLength: _challenge.codeLength);
    _startCountdown();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final p = _challenge.phone;
    // LTR isolate so the number reads correctly inside Arabic text.
    final phone = '\u2066+966 ${p.substring(0, 2)} ${p.substring(2, 5)} ${p.substring(5)}\u2069';
    final canResend = _secondsLeft <= 0;
    return Scaffold(
      body: Column(
        children: [
          AuthHero(height: 196, emblemSize: const Size(106, 104), onBack: () => context.pop()),
          Expanded(
            child: PinnedBottomBody(
              bottom: ListenableBuilder(
                listenable: _controller,
                builder: (context, _) => JButton(
                  label: l10n.confirm,
                  onPressed: (_controller.text.length == _challenge.codeLength || _loading) && _wait == null
                      ? _verify
                      : null,
                  loading: _loading,
                  expand: true,
                ),
              ),
              children: [
                TitleBlock(
                  title: l10n.otpTitle,
                  subtitle: widget.reauth
                      ? '${l10n.otpReauthNotice}\n${l10n.otpSubtitle(_challenge.codeLength, phone)}'
                      : l10n.otpSubtitle(_challenge.codeLength, phone),
                ),
                // Figma's field is 280 wide for 4 cells; 6 cells take the full width so they stay large.
                JOtpField(
                  length: _challenge.codeLength,
                  controller: _controller,
                  autofocus: true,
                  semanticLabel: l10n.otpFieldLabel,
                  errorText: _error,
                  onCompleted: (_) => _verify(),
                ),
                Align(
                  alignment: AlignmentDirectional.centerStart,
                  child: JButton(
                    label: canResend ? l10n.otpResend : l10n.otpResendIn(_clock),
                    onPressed: canResend && !_loading && !_resending ? _resend : null,
                    variant: JButtonVariant.ghost,
                    size: JButtonSize.s,
                  ),
                ),
                const TrustRow(),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
