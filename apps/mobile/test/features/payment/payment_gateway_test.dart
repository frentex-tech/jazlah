import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/features/payment/data/payment_gateway.dart';
import 'package:jazlah/features/payment/domain/payment_method.dart';
import 'package:webview_flutter/webview_flutter.dart';

void main() {
  const action = PaymentAction(
    paymentId: 'pay-1',
    method: PaymentMethodCode.mada,
    amount: 12300,
    redirectUrl: 'https://gateway.test/3ds/pay-1',
    returnUrl: 'jazlah://checkout/pay/o-1/return',
  );

  test('the hosted page navigates freely until it reaches the return url, which ends the step', () {
    var returned = 0;
    void back() => returned++;
    expect(hostedNavigation('https://gateway.test/3ds/pay-1', action, back), NavigationDecision.navigate);
    expect(hostedNavigation('https://acs.bank.test/challenge?x=1', action, back), NavigationDecision.navigate);
    expect(returned, 0);
    expect(hostedNavigation('jazlah://checkout/pay/o-1/return?status=paid', action, back), NavigationDecision.prevent);
    expect(returned, 1);
  });

  test('the mock gateway: a redirect back to the return url finishes; anything else does not', () async {
    // Only the redirect logic: the sheet is exercised by the payment screen tests.
    String? open(String url, String choice) => choice == 'away' ? 'https://elsewhere.test' : '${action.returnUrl}?p=1';
    var done = false;
    hostedNavigation(open(action.redirectUrl, 'approve')!, action, () => done = true);
    expect(done, isTrue);
    done = false;
    hostedNavigation(open(action.redirectUrl, 'away')!, action, () => done = true);
    expect(done, isFalse);
  });
}
