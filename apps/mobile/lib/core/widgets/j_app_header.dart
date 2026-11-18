import 'package:flutter/material.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/widgets/j_icons.dart';

/// Figma `App header`: type home / page × cart empty / filled.
/// Cart is filled when [cartCount] > 0. A null callback hides that button but keeps its space
/// (as the screens do for tab roots without back, or pages without a cart).
class JAppHeader extends StatelessWidget {
  /// type=home: wordmark and delivery location at the start, notifications and cart at the end.
  const JAppHeader.home({
    required this.title,
    required this.location,
    required this.notificationsLabel,
    required this.cartLabel,
    super.key,
    this.onLocationTap,
    this.onNotifications,
    this.onCart,
    this.cartCount = 0,
  }) : _home = true,
       onBack = null;

  /// type=page: back at the start, centred title, cart at the end.
  const JAppHeader.page({
    required this.title,
    required this.cartLabel,
    super.key,
    this.onBack,
    this.onCart,
    this.cartCount = 0,
  }) : _home = false,
       location = null,
       notificationsLabel = null,
       onLocationTap = null,
       onNotifications = null;

  final bool _home;
  final String title;
  final String? location;
  final String? notificationsLabel;
  final String cartLabel;
  final VoidCallback? onLocationTap;
  final VoidCallback? onNotifications;
  final VoidCallback? onCart;
  final VoidCallback? onBack;
  final int cartCount;

  @override
  Widget build(BuildContext context) {
    final cart = _CircleButton(
      icon: JIcons.shoppingBag,
      label: cartLabel,
      onTap: onCart,
      count: cartCount,
    );
    return Container(
      color: JColors.bg,
      padding: const EdgeInsetsDirectional.symmetric(horizontal: JSpace.s16, vertical: JSpace.s12),
      child: _home ? _homeRow(cart) : _pageRow(context, cart),
    );
  }

  Widget _homeRow(Widget cart) {
    return Row(
      children: [
        Expanded(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: JText.displayL.copyWith(color: JColors.brand)),
              const SizedBox(height: 2),
              GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: onLocationTap,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(JIcons.mapPinFill, size: 16, color: JColors.ember),
                    const SizedBox(width: JSpace.s4),
                    Flexible(
                      child: Text(
                        location!,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: JText.labelM.copyWith(color: JColors.ink2),
                      ),
                    ),
                    const SizedBox(width: JSpace.s4),
                    const Icon(JIcons.caretDown, size: 14, color: JColors.ink2),
                  ],
                ),
              ),
            ],
          ),
        ),
        _CircleButton(icon: JIcons.bell, label: notificationsLabel!, onTap: onNotifications),
        const SizedBox(width: JSpace.s8),
        cart,
      ],
    );
  }

  Widget _pageRow(BuildContext context, Widget cart) {
    final rtl = Directionality.of(context) == TextDirection.rtl;
    return Row(
      children: [
        _CircleButton(
          // The spec's back arrow points right in Arabic; it flips in English.
          icon: rtl ? JIcons.caretRight : JIcons.caretLeft,
          iconSize: 20,
          label: MaterialLocalizations.of(context).backButtonTooltip,
          onTap: onBack,
        ),
        Expanded(
          child: Text(
            title,
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: JText.h2,
          ),
        ),
        cart,
      ],
    );
  }
}

/// 44 paper circle with a line stroke; optional ember counter at the top end.
class _CircleButton extends StatelessWidget {
  const _CircleButton({
    required this.icon,
    required this.label,
    required this.onTap,
    this.iconSize = 22,
    this.count = 0,
  });

  final IconData icon;
  final double iconSize;
  final String label;
  final VoidCallback? onTap;
  final int count;

  @override
  Widget build(BuildContext context) {
    final button = Semantics(
      button: true,
      label: count > 0 ? '$label $count' : label,
      excludeSemantics: true,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: onTap,
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            Container(
              width: 44,
              height: 44,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: JColors.paper,
                shape: BoxShape.circle,
                border: Border.all(color: JColors.line),
              ),
              child: Icon(icon, size: iconSize, color: JColors.ink),
            ),
            if (count > 0)
              PositionedDirectional(
                top: -6,
                end: -6,
                child: Container(
                  width: 20,
                  height: 20,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: JColors.ember,
                    shape: BoxShape.circle,
                    border: Border.all(color: JColors.paper, width: 2),
                  ),
                  child: Text(
                    count > 9 ? '9+' : '$count',
                    style: JText.caption.copyWith(color: JColors.paper),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
    // Hidden buttons keep their space so the title stays centred.
    return onTap == null ? Visibility.maintain(visible: false, child: button) : button;
  }
}
