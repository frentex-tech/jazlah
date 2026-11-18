import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:jazlah/app/router/router.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/core/errors/error_text.dart';
import 'package:jazlah/core/geo/geo_point.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/addresses/domain/address.dart';
import 'package:jazlah/features/addresses/presentation/address_providers.dart';
import 'package:jazlah/features/location/presentation/map_picker_screen.dart';
import 'package:jazlah/l10n/app_localizations.dart';

/// Addresses/Edit (Figma 86-9219 default, 86-9264 error, 86-9334 loading), also used to add an address
/// after the map. Driver notes, the default checkbox, "change on map" and the locked/out-of-coverage
/// banners are not in Figma; they use the design-system Input, Checkbox, ghost Button and banner.
class AddressFormScreen extends ConsumerStatefulWidget {
  const AddressFormScreen.edit({required Address this.address, super.key}) : place = null;

  const AddressFormScreen.add({required PickedPlace this.place, super.key}) : address = null;

  final Address? address;
  final PickedPlace? place;

  @override
  ConsumerState<AddressFormScreen> createState() => _AddressFormScreenState();
}

class _AddressFormScreenState extends ConsumerState<AddressFormScreen> {
  late final _label = TextEditingController(text: widget.address?.label);
  late final _city = TextEditingController(text: widget.address?.city ?? widget.place?.address.city);
  late final _district = TextEditingController(text: widget.address?.district ?? widget.place?.address.district);
  late final _street = TextEditingController(text: widget.address?.street ?? widget.place?.address.street);
  late final _notes = TextEditingController(text: widget.address?.driverInstructions);
  late GeoPoint _point = widget.address?.point ?? widget.place!.point;
  late bool _covered = widget.address?.covered ?? widget.place!.coverage.covered;

  /// A field the API refused (VALIDATION_FAILED), shown under that field.
  String? _serverField;
  String? _serverMessage;
  late bool _isDefault = widget.address?.isDefault ?? false;
  bool _submitted = false;
  bool _saving = false;
  bool _deleting = false;

  bool get _editing => widget.address != null;
  bool get _locked => widget.address?.locked ?? false;

  @override
  void initState() {
    super.initState();
    final fields = {
      'label': _label,
      'city': _city,
      'district': _district,
      'street': _street,
      'driverInstructions': _notes,
    };
    for (final MapEntry(:key, :value) in fields.entries) {
      value.addListener(() => setState(() => _serverField == key ? _serverField = null : null));
    }
  }

  String? _server(String field) => _serverField == field ? _serverMessage : null;

  @override
  void dispose() {
    for (final c in [_label, _city, _district, _street, _notes]) {
      c.dispose();
    }
    super.dispose();
  }

  String? _required(TextEditingController c, String message) => _submitted && c.text.trim().isEmpty ? message : null;

  bool get _valid => _label.text.trim().isNotEmpty && _district.text.trim().isNotEmpty;

  Future<void> _changeOnMap() async {
    final place = await context.push<PickedPlace>(Routes.addAddressMap, extra: _point);
    if (place == null || !mounted) return;
    setState(() {
      _point = place.point;
      _covered = place.coverage.covered;
      // A new pin fills the readable fields again; the customer may edit them.
      _city.text = place.address.city ?? '';
      _district.text = place.address.district ?? '';
      _street.text = place.address.street ?? '';
    });
  }

  Future<void> _save() async {
    final l10n = AppLocalizations.of(context);
    setState(() => _submitted = true);
    if (!_valid) return;
    setState(() => _saving = true);
    final draft = AddressDraft(
      label: _label.text,
      point: _point,
      city: _city.text,
      district: _district.text,
      street: _street.text,
      driverInstructions: _notes.text,
      isDefault: _isDefault,
    );
    final repo = ref.read(addressRepositoryProvider);
    try {
      _editing ? await repo.update(widget.address!, draft) : await repo.create(draft);
      if (!mounted) return;
      ref.invalidate(addressesProvider);
      context.pop();
    } on ApiError catch (e) {
      if (!mounted) return;
      const known = {'label', 'city', 'district', 'street', 'driverInstructions'};
      final field = e.invalidFields.where(known.contains).firstOrNull;
      if (e.code == 'VALIDATION_FAILED' && field != null) {
        setState(() {
          _serverField = field;
          _serverMessage = e.message ?? l10n.errorGeneric;
        });
        return;
      }
      final message = switch (e.code) {
        'ADDRESS_LIMIT_REACHED' => l10n.addrLimitReached((e.details as Map?)?['limit'] as int? ?? 10),
        _ => errorText(context, e),
      };
      showJToast(context, message: message, kind: JToastKind.error);
      if (e.code == 'NOT_FOUND') context.pop();
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _delete() async {
    final l10n = AppLocalizations.of(context);
    final ok = await showJDialog(
      context,
      title: l10n.addrDeleteTitle,
      body: l10n.addrDeleteBody,
      confirmLabel: l10n.delete,
      cancelLabel: l10n.cancel,
      type: JDialogType.destructive,
    );
    if (ok != true || !mounted) return;
    setState(() => _deleting = true);
    try {
      await ref.read(addressRepositoryProvider).delete(widget.address!.id);
      if (!mounted) return;
      ref.invalidate(addressesProvider);
      context.pop();
    } on ApiError catch (e) {
      if (!mounted) return;
      showJToast(context, message: errorText(context, e), kind: JToastKind.error);
      // Deleted elsewhere: back to the reloaded list (errors.md, "Reload").
      if (e.code == 'NOT_FOUND') {
        ref.invalidate(addressesProvider);
        context.pop();
      }
    } finally {
      if (mounted) setState(() => _deleting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final enabled = !_locked && !_saving && !_deleting;
    Widget field(TextEditingController c, String label, {String? error, int maxLength = 100, int maxLines = 1}) =>
        JTextField(
          controller: c,
          label: label,
          placeholder: l10n.fieldPlaceholder,
          errorText: error,
          enabled: !_locked,
          maxLines: maxLines,
          inputFormatters: [LengthLimitingTextInputFormatter(maxLength)],
        );
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            JAppHeader.page(
              title: _editing ? l10n.addrEdit : l10n.addrNewTitle,
              cartLabel: l10n.cart,
              onBack: () => context.pop(),
            ),
            Expanded(
              child: CustomScrollView(
                slivers: [
                  SliverFillRemaining(
                    hasScrollBody: false,
                    child: Padding(
                      padding: const EdgeInsets.all(JSpace.s16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          if (_locked) ...[
                            LocationBanner(text: l10n.addrLockedNotice),
                            const SizedBox(height: JSpace.s12),
                          ],
                          if (!_covered) ...[
                            LocationBanner(text: l10n.addrOutOfCoverageNotice),
                            const SizedBox(height: JSpace.s12),
                          ],
                          field(
                            _label,
                            l10n.addrLabel,
                            error: _required(_label, l10n.addrLabelRequired),
                            maxLength: 30,
                          ),
                          const SizedBox(height: JSpace.s12),
                          field(_city, l10n.addrCity, error: _server('city')),
                          const SizedBox(height: JSpace.s12),
                          field(
                            _district,
                            l10n.addrDistrict,
                            error: _required(_district, l10n.addrDistrictRequired) ?? _server('district'),
                          ),
                          const SizedBox(height: JSpace.s12),
                          field(_street, l10n.addrStreet, error: _server('street')),
                          const SizedBox(height: JSpace.s12),
                          JTextField(
                            controller: _notes,
                            label: l10n.addrDriverNotes,
                            placeholder: l10n.addrDriverNotesHint,
                            errorText: _server('driverInstructions'),
                            enabled: !_locked,
                            maxLines: 3,
                            inputFormatters: [LengthLimitingTextInputFormatter(300)],
                          ),
                          const SizedBox(height: JSpace.s12),
                          if (!(widget.address?.isDefault ?? false))
                            Align(
                              alignment: AlignmentDirectional.centerStart,
                              child: JCheckbox(
                                checked: _isDefault,
                                label: l10n.addrMakeDefault,
                                onChanged: _locked ? null : (v) => setState(() => _isDefault = v),
                              ),
                            ),
                          if (!_locked)
                            Align(
                              alignment: AlignmentDirectional.centerStart,
                              child: JButton(
                                label: l10n.addrChangeOnMap,
                                variant: JButtonVariant.ghost,
                                size: JButtonSize.s,
                                onPressed: enabled ? _changeOnMap : null,
                              ),
                            ),
                          const Spacer(),
                          const SizedBox(height: JSpace.s12),
                          JButton(
                            label: _editing ? l10n.addrSave : l10n.addrSaveNew,
                            expand: true,
                            loading: _saving,
                            onPressed: enabled && (!_submitted || _valid) ? _save : null,
                          ),
                          if (_editing) ...[
                            const SizedBox(height: JSpace.s12),
                            JButton(
                              label: l10n.addrDelete,
                              variant: JButtonVariant.ghost,
                              expand: true,
                              loading: _deleting,
                              onPressed: enabled ? _delete : null,
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
