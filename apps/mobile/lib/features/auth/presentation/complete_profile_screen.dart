import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:jazlah/app/router/router.dart';
import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/core/errors/error_text.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/auth/presentation/session_controller.dart';
import 'package:jazlah/features/auth/presentation/widgets/auth_parts.dart';
import 'package:jazlah/features/profile/presentation/profile_providers.dart';
import 'package:jazlah/l10n/app_localizations.dart';

/// Login/Profile (Figma 123-3677 default, 123-3754 filled, 123-3850 error, 123-3946 loading).
/// After the first sign-in the customer may skip it (back); with [editing] it edits the profile.
class CompleteProfileScreen extends ConsumerStatefulWidget {
  const CompleteProfileScreen({this.editing = false, super.key});

  final bool editing;

  @override
  ConsumerState<CompleteProfileScreen> createState() => _CompleteProfileScreenState();
}

class _CompleteProfileScreenState extends ConsumerState<CompleteProfileScreen> {
  final _name = TextEditingController();
  final _email = TextEditingController();
  bool _consent = false;
  bool _initialConsent = false;
  String? _initialName;
  String? _initialEmail;
  bool _nameTouched = false;
  bool _submitted = false;
  bool _loading = false;
  String? _emailServerError;

  @override
  void initState() {
    super.initState();
    _name.addListener(() => setState(() => _nameTouched = true));
    _email.addListener(() => setState(() => _emailServerError = null));
    if (widget.editing) unawaited(_prefill());
  }

  Future<void> _prefill() async {
    try {
      final p = await ref.read(profileProvider.future);
      if (!mounted) return;
      // Never overwrite what the user already typed while the profile was loading.
      if (_name.text.isEmpty) _name.text = p.fullName ?? '';
      if (_email.text.isEmpty) _email.text = p.email ?? '';
      setState(() {
        _initialName = p.fullName;
        _initialEmail = p.email;
        _consent = _initialConsent = p.marketingConsent;
        _nameTouched = false;
      });
    } on Object catch (e) {
      if (!mounted) return;
      showJToast(context, message: errorText(context, e), kind: JToastKind.error);
      context.pop();
    }
  }

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    super.dispose();
  }

  String? _nameError(AppLocalizations l10n) {
    final n = _name.text.trim();
    if (n.isEmpty) return _nameTouched || _submitted ? l10n.nameRequired : null;
    if (n.length < 2 || n.length > 60) return _submitted ? l10n.nameLength : null;
    return null;
  }

  String? _emailError(AppLocalizations l10n) {
    final e = _email.text.trim();
    final bad = e.isNotEmpty && !RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(e);
    return (_submitted && bad) || _emailServerError != null ? (_emailServerError ?? l10n.emailInvalid) : null;
  }

  Future<void> _save() async {
    final l10n = AppLocalizations.of(context);
    setState(() => _submitted = true);
    if (_nameError(l10n) != null || _emailError(l10n) != null) return;
    setState(() => _loading = true);
    final repo = ref.read(profileRepositoryProvider);
    final name = _name.text.trim();
    final email = _email.text.trim();
    // PATCH sends only what changed (customer-profile.md); an empty email removes the saved one.
    final nameChanged = name != (_initialName ?? '');
    final emailChanged = email != (_initialEmail ?? '');
    final language = widget.editing ? null : Localizations.localeOf(context).languageCode;
    try {
      if (nameChanged || emailChanged || language != null) {
        await repo.update(
          fullName: nameChanged ? name : null,
          email: emailChanged ? email : null,
          preferredLanguage: language,
        );
      }
      if (_consent != _initialConsent) await repo.setMarketingConsent(granted: _consent);
      if (!mounted) return;
      ref.invalidate(profileProvider);
      widget.editing ? context.pop() : context.go(Routes.home);
    } on ApiError catch (e) {
      if (!mounted) return;
      if (e.code == 'VALIDATION_FAILED' && e.invalidFields.contains('email')) {
        setState(() => _emailServerError = l10n.emailInvalid);
      } else {
        showJToast(context, message: errorText(context, e), kind: JToastKind.error);
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _back() {
    if (widget.editing) return context.pop();
    // The name is optional until checkout: back skips the step.
    context.go(Routes.home);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final hasName = _name.text.trim().isNotEmpty;
    return Scaffold(
      body: Column(
        children: [
          AuthHero(height: 176, emblemSize: const Size(106, 104), onBack: _back),
          Expanded(
            child: PinnedBottomBody(
              bottom: JButton(
                label: widget.editing ? l10n.save : l10n.saveAndContinue,
                onPressed: hasName || _loading ? _save : null,
                loading: _loading,
                expand: true,
              ),
              children: [
                TitleBlock(
                  title: widget.editing ? l10n.editProfileTitle : l10n.profileTitle,
                  subtitle: l10n.profileSubtitle,
                ),
                JTextField(
                  controller: _name,
                  label: l10n.fullNameLabel,
                  placeholder: l10n.fieldPlaceholder,
                  errorText: _nameError(l10n),
                  textInputAction: TextInputAction.next,
                  autofillHints: const [AutofillHints.name],
                  inputFormatters: [LengthLimitingTextInputFormatter(60)],
                ),
                JTextField(
                  controller: _email,
                  label: l10n.emailLabel,
                  placeholder: l10n.fieldPlaceholder,
                  helperText: l10n.emailHint,
                  errorText: _emailError(l10n),
                  keyboardType: TextInputType.emailAddress,
                  autofillHints: const [AutofillHints.email],
                  inputFormatters: [LengthLimitingTextInputFormatter(254)],
                ),
                Align(
                  alignment: AlignmentDirectional.centerStart,
                  child: JCheckbox(
                    checked: _consent,
                    label: l10n.marketingConsent,
                    onChanged: (v) => setState(() => _consent = v),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
