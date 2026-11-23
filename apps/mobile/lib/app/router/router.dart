import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:jazlah/app/providers.dart';
import 'package:jazlah/app/shell/main_shell.dart';
import 'package:jazlah/core/geo/geo_point.dart';
import 'package:jazlah/core/widgets/gallery/gallery_screen.dart';
import 'package:jazlah/features/addresses/domain/address.dart';
import 'package:jazlah/features/addresses/presentation/address_form_screen.dart';
import 'package:jazlah/features/addresses/presentation/addresses_screen.dart';
import 'package:jazlah/features/auth/domain/otp_challenge.dart';
import 'package:jazlah/features/auth/presentation/complete_profile_screen.dart';
import 'package:jazlah/features/auth/presentation/onboarding_controller.dart';
import 'package:jazlah/features/auth/presentation/onboarding_screen.dart';
import 'package:jazlah/features/auth/presentation/otp_screen.dart';
import 'package:jazlah/features/auth/presentation/phone_screen.dart';
import 'package:jazlah/features/auth/presentation/session_controller.dart';
import 'package:jazlah/features/cart/presentation/cart_screen.dart';
import 'package:jazlah/features/checkout/domain/order.dart';
import 'package:jazlah/features/checkout/presentation/checkout_screen.dart';
import 'package:jazlah/features/checkout/presentation/order_placed_screen.dart';
import 'package:jazlah/features/checkout/presentation/review_screen.dart';
import 'package:jazlah/features/home/presentation/categories_screen.dart';
import 'package:jazlah/features/home/presentation/home_screen.dart';
import 'package:jazlah/features/home/presentation/stores_screen.dart';
import 'package:jazlah/features/location/presentation/map_picker_screen.dart';
import 'package:jazlah/features/location/presentation/out_of_coverage_screen.dart';
import 'package:jazlah/features/orders/presentation/order_detail_screen.dart';
import 'package:jazlah/features/orders/presentation/orders_screen.dart';
import 'package:jazlah/features/payment/presentation/payment_screen.dart';
import 'package:jazlah/features/product/presentation/product_screen.dart';
import 'package:jazlah/features/profile/presentation/account_screen.dart';
import 'package:jazlah/features/profile/presentation/settings_screen.dart';
import 'package:jazlah/features/search/presentation/search_screen.dart';
import 'package:jazlah/features/store/presentation/category_screen.dart';
import 'package:jazlah/features/store/presentation/store_screen.dart';
import 'package:jazlah/l10n/app_localizations.dart';

abstract final class Routes {
  static const splash = '/splash';
  static const onboarding = '/onboarding';
  static const phone = '/login';
  static const otp = '/login/otp';
  static const completeProfile = '/login/profile';
  static const home = '/home';
  static const categories = '/home/categories';
  static const stores = '/home/stores';
  static String category(String id) => '/home/category/$id';
  static String store(String id) => '/home/store/$id';
  static String product(String id) => '/product/$id';
  static const search = '/search';
  static const notifications = '/notifications';
  static const cart = '/cart';
  static const checkout = '/checkout';
  static const checkoutReview = '/checkout/review';
  static const orderPlaced = '/checkout/placed';
  static String payment(String orderId) => '/checkout/pay/$orderId';
  static String order(String id) => '/orders/$id';
  static const orders = '/orders';
  static const services = '/services';
  static const account = '/account';
  static const editProfile = '/account/edit';
  static const settings = '/account/settings';
  static const reauth = '/account/settings/verify';
  static const addresses = '/account/addresses';
  static const addressNew = '/account/addresses/new';
  static const addressEdit = '/account/addresses/edit';
  static const addAddressMap = '/account/addresses/map';
  static const pickLocation = '/location';
  static const outOfCoverage = '/location/outside';
  static const gallery = '/gallery';
}

/// Routes. Deep links `jazlah://<path>` open the same paths (Info.plist URL type, Android intent filter).
/// Universal links: placeholder host in the Android manifest; iOS needs the Associated Domains
/// entitlement once the domain and the signing team exist.
final routerProvider = Provider<GoRouter>((ref) {
  final env = ref.watch(envProvider);
  final refresh = ValueNotifier(0);
  ref
    ..listen(sessionProvider, (_, _) => refresh.value++)
    ..listen(onboardingSeenProvider, (_, _) => refresh.value++)
    ..onDispose(refresh.dispose);

  return GoRouter(
    initialLocation: env.initialRoute == '/' ? Routes.home : env.initialRoute,
    refreshListenable: refresh,
    redirect: (context, state) => authRedirect(
      uri: state.uri,
      session: ref.read(sessionProvider),
      onboardingSeen: ref.read(onboardingSeenProvider),
      pendingPayment: ref.read(prefsProvider).pendingPayment,
    ),
    routes: [
      GoRoute(path: '/', redirect: (_, _) => Routes.home),
      GoRoute(path: Routes.splash, builder: (_, _) => const OnboardingScreen(loading: true)),
      GoRoute(path: Routes.onboarding, builder: (_, _) => const OnboardingScreen()),
      GoRoute(path: Routes.phone, builder: (_, _) => const PhoneScreen()),
      GoRoute(
        path: Routes.otp,
        redirect: (_, state) => state.extra is OtpChallenge ? null : Routes.phone,
        builder: (_, state) =>
            OtpScreen(challenge: state.extra! as OtpChallenge, next: safeNext(state.uri.queryParameters['from'])),
      ),
      GoRoute(path: Routes.completeProfile, builder: (_, _) => const CompleteProfileScreen()),
      GoRoute(path: Routes.editProfile, builder: (_, _) => const CompleteProfileScreen(editing: true)),
      GoRoute(
        path: Routes.reauth,
        redirect: (_, state) => state.extra is OtpChallenge ? null : Routes.settings,
        builder: (_, state) => OtpScreen(challenge: state.extra! as OtpChallenge, reauth: true),
      ),
      GoRoute(path: Routes.pickLocation, builder: (_, _) => const MapPickerScreen()),
      // Saving an address accepts a point outside coverage; it is flagged, not refused.
      GoRoute(
        path: Routes.addAddressMap,
        builder: (_, state) => MapPickerScreen(initial: state.extra as GeoPoint?, allowOutOfCoverage: true),
      ),
      GoRoute(
        path: Routes.addressNew,
        redirect: (_, state) => state.extra is PickedPlace ? null : Routes.addresses,
        builder: (_, state) => AddressFormScreen.add(place: state.extra! as PickedPlace),
      ),
      GoRoute(
        path: Routes.addressEdit,
        redirect: (_, state) => state.extra is Address ? null : Routes.addresses,
        builder: (_, state) => AddressFormScreen.edit(address: state.extra! as Address),
      ),
      GoRoute(
        path: Routes.outOfCoverage,
        redirect: (_, state) => state.extra is GeoPoint ? null : Routes.pickLocation,
        builder: (_, state) => OutOfCoverageScreen(point: state.extra! as GeoPoint),
      ),
      // Full screen like Figma (no tab bar). The name, when the caller knows it, titles the loading state.
      GoRoute(
        path: '/home/store/:id',
        builder: (_, state) => StoreScreen(id: state.pathParameters['id']!, name: state.extra as String?),
      ),
      // shortcut: placeholder until NOT-MOB-1 (#105) builds the notification center.
      GoRoute(
        path: Routes.notifications,
        builder: (context, _) => ComingSoonPage(title: AppLocalizations.of(context).menuNotifications),
      ),
      GoRoute(path: Routes.cart, builder: (_, _) => const CartScreen()),
      GoRoute(path: Routes.checkout, builder: (_, _) => const CheckoutScreen()),
      GoRoute(path: Routes.checkoutReview, builder: (_, _) => const ReviewScreen()),
      GoRoute(
        path: Routes.orderPlaced,
        redirect: (_, state) => state.extra is OrderPlacedArgs ? null : Routes.home,
        builder: (_, state) => OrderPlacedScreen(args: state.extra! as OrderPlacedArgs),
      ),
      // The placement's answer comes as extra; opened again (no extra), the screen reads the order's status.
      GoRoute(
        path: '/checkout/pay/:orderId',
        builder: (_, state) =>
            PaymentScreen(orderId: state.pathParameters['orderId']!, placed: state.extra as PlacedOrder?),
      ),
      // Full screen like Figma (no tab bar).
      GoRoute(
        path: '/orders/:id',
        builder: (_, state) => OrderDetailScreen(id: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/product/:id',
        builder: (_, state) => productPage(state.pathParameters['id']!),
      ),
      // Full screen like Figma (no tab bar).
      GoRoute(path: Routes.search, builder: (_, _) => const SearchScreen()),
      ShellRoute(
        builder: (_, state, child) => MainShell(location: state.matchedLocation, child: child),
        routes: [
          GoRoute(path: Routes.home, builder: (_, _) => const HomeScreen()),
          GoRoute(path: Routes.categories, builder: (_, _) => const CategoriesScreen()),
          GoRoute(path: Routes.stores, builder: (_, _) => const StoresScreen()),
          GoRoute(
            path: '/home/category/:id',
            builder: (_, state) => CategoryScreen(id: state.pathParameters['id']!, name: state.extra as String?),
          ),
          GoRoute(
            path: Routes.services,
            builder: (_, _) => const PlaceholderTab(tab: MainTab.services),
          ),
          GoRoute(path: Routes.orders, builder: (_, _) => const OrdersScreen()),
          GoRoute(path: Routes.account, builder: (_, _) => const AccountScreen()),
          GoRoute(path: Routes.settings, builder: (_, _) => const SettingsScreen()),
          GoRoute(path: Routes.addresses, builder: (_, _) => const AddressesScreen()),
        ],
      ),
      if (env.showGallery) GoRoute(path: Routes.gallery, builder: (_, _) => const GalleryScreen()),
    ],
  );
});

/// A product page keyed by its id: another product in the same place opens fresh (gallery page 1, at the top, its
/// own default size) instead of keeping the previous one's state.
Widget productPage(String id) => ProductScreen(key: ValueKey(id), id: id);

/// The header cart button (its badge is `cartCountProvider`).
void openCart(BuildContext context) => context.push(Routes.cart);

/// Back to the previous page, or home when the page was opened by a link.
void popOrHome(BuildContext context) => context.canPop() ? context.pop() : context.go(Routes.home);

/// Back to the previous page (the cart, below checkout), or the cart when the page was opened by a link.
void popOrCart(BuildContext context) => context.canPop() ? context.pop() : context.go(Routes.cart);

/// Only in-app paths may be a redirect target (no `//host` or scheme).
String? safeNext(String? from) => from != null && from.startsWith('/') && !from.startsWith('//') ? from : null;

/// Where a location goes for a session state; null keeps it. A deep link opened while the session is
/// loading or signed out travels in `?from=` and is opened once the user may see it.
@visibleForTesting
String? authRedirect({
  required Uri uri,
  required SessionStatus session,
  required bool onboardingSeen,
  String? pendingPayment,
}) {
  final location = uri.path;
  if (location == Routes.gallery) return null;
  final from = safeNext(uri.queryParameters['from']);
  final gate = location == Routes.splash || location == Routes.onboarding;
  // Only a link opened at start-up travels: the splash records it, the gates pass it on.
  // (After signing out or deleting the account, the page the user was on is not carried.)
  final target = gate ? from : (session == SessionStatus.unknown && location != Routes.home ? uri.toString() : null);
  String withFrom(String path) => target == null ? path : '$path?from=${Uri.encodeComponent(target)}';

  if (session == SessionStatus.unknown) return location == Routes.splash ? null : withFrom(Routes.splash);
  final inLogin = location == Routes.phone || location == Routes.otp;
  if (!onboardingSeen && session != SessionStatus.signedIn) {
    return location == Routes.onboarding ? null : withFrom(Routes.onboarding);
  }
  return switch (session) {
    SessionStatus.signedOut => inLogin ? null : withFrom(Routes.phone),
    SessionStatus.guest =>
      gate
          ? (from ?? Routes.home)
          : location.startsWith('${Routes.account}/')
          ? Routes.account
          : null,
    // A payment left mid-way (the app was killed during 3DS) reopens at start: its screen reads the outcome.
    SessionStatus.signedIn =>
      gate && from == null && pendingPayment != null
          ? Routes.payment(pendingPayment)
          : inLogin || gate
          ? (from ?? Routes.home)
          : null,
    SessionStatus.unknown => null,
  };
}
