import 'package:flutter/material.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/catalog/presentation/catalog_widgets.dart';
import 'package:jazlah/features/payment/domain/payment_method.dart';
import 'package:jazlah/l10n/app_localizations.dart';
import 'package:webview_flutter/webview_flutter.dart';

/// How the gateway step ended on the device. It says nothing about the payment's outcome: the app then reads
/// the order's status from the server (never trust the redirect).
enum GatewayResult { finished, cancelled }

/// The payment port on the device: runs the gateway's step for a redirect next action (the provider's hosted
/// page: 3DS, Apple Pay, the fake provider's approve/decline page). The same port serves a deposit or a remaining
/// amount later (OCC-MOB-1 #124): it only needs the next action.
// ignore: one_member_abstracts, the seam between the hosted page, a gateway SDK (PAY-MOB-2 #79) and the mock.
abstract interface class PaymentGateway {
  Future<GatewayResult> startPayment(BuildContext context, PaymentAction action);
}

/// The hosted page in an in-app webview: opens the next action's url and closes when the page navigates to its
/// return url (finished), or when the customer closes it (cancelled). Real builds use it.
class HostedPagePaymentGateway implements PaymentGateway {
  const HostedPagePaymentGateway();

  @override
  Future<GatewayResult> startPayment(BuildContext context, PaymentAction action) async {
    final result = await Navigator.of(context).push<GatewayResult>(
      MaterialPageRoute(fullscreenDialog: true, builder: (_) => _HostedPage(action: action)),
    );
    return result ?? GatewayResult.cancelled;
  }
}

/// Decides each navigation of the hosted page: the return url ends the step (and is not loaded).
NavigationDecision hostedNavigation(String url, PaymentAction action, VoidCallback onReturn) {
  if (!isReturnUrl(url, action.returnUrl)) return NavigationDecision.navigate;
  onReturn();
  return NavigationDecision.prevent;
}

class _HostedPage extends StatefulWidget {
  const _HostedPage({required this.action});

  final PaymentAction action;

  @override
  State<_HostedPage> createState() => _HostedPageState();
}

class _HostedPageState extends State<_HostedPage> {
  late final WebViewController _web = WebViewController()
    ..setJavaScriptMode(JavaScriptMode.unrestricted) // 3DS pages need scripts
    ..setNavigationDelegate(
      NavigationDelegate(
        onNavigationRequest: (r) => hostedNavigation(r.url, widget.action, _back),
      ),
    )
    ..loadRequest(Uri.parse(widget.action.url));

  var _done = false;

  void _back() {
    if (_done || !mounted) return;
    _done = true;
    Navigator.of(context).pop(GatewayResult.finished);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            JAppHeader.page(
              title: l10n.reviewTitle,
              cartLabel: l10n.cart,
              onBack: () => Navigator.of(context).pop(GatewayResult.cancelled),
            ),
            Expanded(child: WebViewWidget(controller: _web)),
          ],
        ),
      ),
    );
  }
}

/// The fake provider's hosted page for USE_MOCKS, behind the same redirect: a sheet stands in for the webview;
/// approving, declining or cancelling "loads" the page at the action's url on the mock provider ([open]), which
/// records the choice like its webhook and answers a redirect. The step ends when that redirect is the return url
/// ([hostedNavigation], as in the webview). Closing the sheet leaves the payment open (cancelled).
// shortcut: a sheet instead of a mock web page until the API's fake provider serves one (PAY-API-1 #76).
class MockHostedPageGateway implements PaymentGateway {
  MockHostedPageGateway(this.open);

  /// The mock provider: the page at a url with the customer's choice (approve, decline, cancel) → the redirect.
  final String? Function(String url, String choice) open;

  @override
  Future<GatewayResult> startPayment(BuildContext context, PaymentAction action) async {
    final choice = await showJBottomSheet<String>(
      context,
      title: AppLocalizations.of(context).payFakeTitle,
      builder: (_) => _FakePage(action: action),
    );
    if (choice == null) return GatewayResult.cancelled;
    final redirect = open(action.url, choice);
    var returned = false;
    if (redirect != null) hostedNavigation(redirect, action, () => returned = true);
    return returned ? GatewayResult.finished : GatewayResult.cancelled;
  }
}

class _FakePage extends StatelessWidget {
  const _FakePage({required this.action});

  final PaymentAction action;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(l10n.payFakeBody(formatHalalas(action.amount)), style: JText.bodyM.copyWith(color: JColors.ink2)),
        const SizedBox(height: JSpace.s16),
        JButton(label: l10n.payFakeApprove, expand: true, onPressed: () => Navigator.of(context).pop('approve')),
        const SizedBox(height: JSpace.s8),
        JButton(
          label: l10n.payFakeDecline,
          expand: true,
          variant: JButtonVariant.secondary,
          onPressed: () => Navigator.of(context).pop('decline'),
        ),
        const SizedBox(height: JSpace.s8),
        JButton(
          label: l10n.payCancelPage,
          expand: true,
          variant: JButtonVariant.ghost,
          onPressed: () => Navigator.of(context).pop('cancel'),
        ),
      ],
    );
  }
}
