import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart' show DateFormat;

import 'package:jazlah/app/router/router.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/cart/presentation/cart_screen.dart';
import 'package:jazlah/features/catalog/presentation/catalog_widgets.dart';
import 'package:jazlah/features/checkout/domain/fulfilment.dart';
import 'package:jazlah/features/checkout/domain/order.dart';
import 'package:jazlah/features/checkout/presentation/review_screen.dart';
import 'package:jazlah/features/payment/domain/payment_method.dart';
import 'package:jazlah/features/payment/presentation/payment_widgets.dart';
import 'package:jazlah/features/product/domain/product.dart';
import 'package:jazlah/l10n/app_localizations.dart';

/// «تم استلام طلبك» (Figma 170-29472): a paid order, or one with nothing left to pay (COD, wallet only). Back goes home:
/// the cart is empty and the order cannot be placed again.
class OrderPlacedScreen extends StatelessWidget {
  const OrderPlacedScreen({required this.args, super.key});

  final OrderPlacedArgs args;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final lang = context.lang;
    final o = args.order;
    final date = calendarDate(o.deliveryDate);
    final (start, end) = windowText(l10n, o.window);
    final delivery = o.fulfilment == Fulfilment.delivery;
    final address = o.addressSnapshot;

    Widget fact(String title, String body) => Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(title, style: JText.labelM),
        const SizedBox(height: 2),
        Text(body, style: JText.bodyM.copyWith(color: JColors.ink2)),
      ],
    );

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) => didPop ? null : context.go(Routes.home),
      child: Scaffold(
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(JSpace.s16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Spacer(),
                Center(
                  child: Container(
                    width: 88,
                    height: 88,
                    decoration: const BoxDecoration(color: JColors.sand, shape: BoxShape.circle),
                    child: const Icon(JIcons.checkCircleFill, size: 48, color: JColors.success),
                  ),
                ),
                const SizedBox(height: JSpace.s12),
                Text(l10n.placedTitle, style: JText.h1, textAlign: TextAlign.center),
                const SizedBox(height: JSpace.s12),
                Text(l10n.placedNumber(o.number), style: JText.h3, textAlign: TextAlign.center),
                // Only COD under review stays new until the admin confirms it (ops.cod.confirmation); a paid order is
                // confirmed and never reads «سنراجع طلبك…».
                const SizedBox(height: JSpace.s4),
                Text(
                  o.status == OrderStatus.created && o.paymentMethod == PaymentMethodCode.cod
                      ? l10n.placedUnderReview
                      : l10n.placedConfirmed,
                  style: JText.bodyM.copyWith(color: JColors.ink2),
                  textAlign: TextAlign.center,
                ),
                const Spacer(),
                const SizedBox(height: JSpace.s12),
                CartCard(
                  gap: JSpace.s12,
                  padding: JSpace.s16,
                  children: [
                    fact(
                      l10n.placedFresh(DateFormat('EEEE', lang).format(date)),
                      l10n.placedDateVendor(
                        '${date.day} ${DateFormat('MMMM', lang).format(date)} ${date.year}',
                        o.vendorName.of(lang),
                      ),
                    ),
                    fact(
                      delivery ? l10n.placedDeliveryWindow(start, end) : l10n.placedPickupWindow(start, end),
                      delivery
                          ? (address == null ? '' : addressPlace(context, address))
                          : o.pickupSnapshot?.name.of(lang) ?? '',
                    ),
                    fact(l10n.placedTotal(formatHalalas(o.total)), paymentMethodLabel(l10n, args.method, short: true)),
                  ],
                ),
                const SizedBox(height: JSpace.s12),
                const Spacer(),
                const SizedBox(height: JSpace.s12),
                JButton(
                  label: l10n.placedTrack,
                  expand: true,
                  onPressed: () => context.go(Routes.order(o.id)),
                ),
                const SizedBox(height: JSpace.s12),
                JButton(
                  label: l10n.placedHome,
                  expand: true,
                  variant: JButtonVariant.ghost,
                  onPressed: () => context.go(Routes.home),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
