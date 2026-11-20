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
import 'package:jazlah/features/home/presentation/categories_screen.dart';
import 'package:jazlah/features/home/presentation/home_screen.dart';
import 'package:jazlah/features/home/presentation/stores_screen.dart';
import 'package:jazlah/features/location/presentation/map_picker_screen.dart';
import 'package:jazlah/features/location/presentation/out_of_coverage_screen.dart';
import 'package:jazlah/features/profile/presentation/account_screen.dart';
import 'package:jazlah/features/profile/presentation/settings_screen.dart';
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
      // shortcut: placeholder until CRT-MOB-1 (#64) builds the cart.
      GoRoute(
        path: Routes.cart,
        builder: (context, _) => ComingSoonPage(title: AppLocalizations.of(context).cart),
      ),
      // shortcut: placeholder until STF-MOB-3 (#56) builds the product page.
      GoRoute(
        path: '/product/:id',
        builder: (context, _) => ComingSoonPage(title: AppLocalizations.of(context).productTitle),
      ),
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
          // shortcut: placeholder until STF-MOB-4 (#57) builds search.
          GoRoute(
            path: Routes.search,
            builder: (context, _) => ComingSoonPage(title: AppLocalizations.of(context).searchTitle),
          ),
          GoRoute(
            path: Routes.services,
            builder: (_, _) => const PlaceholderTab(tab: MainTab.services),
          ),
          GoRoute(
            path: Routes.orders,
            builder: (_, _) => const PlaceholderTab(tab: MainTab.orders),
          ),
          GoRoute(path: Routes.account, builder: (_, _) => const AccountScreen()),
          GoRoute(path: Routes.settings, builder: (_, _) => const SettingsScreen()),
          GoRoute(path: Routes.addresses, builder: (_, _) => const AddressesScreen()),
        ],
      ),
      if (env.showGallery) GoRoute(path: Routes.gallery, builder: (_, _) => const GalleryScreen()),
    ],
  );
});

/// The header cart button (cart count stays 0 until CRT-MOB-1 #64).
void openCart(BuildContext context) => context.push(Routes.cart);

/// Back to the previous page, or home when the page was opened by a link.
void popOrHome(BuildContext context) => context.canPop() ? context.pop() : context.go(Routes.home);

/// Only in-app paths may be a redirect target (no `//host` or scheme).
String? safeNext(String? from) => from != null && from.startsWith('/') && !from.startsWith('//') ? from : null;

/// Where a location goes for a session state; null keeps it. A deep link opened while the session is
/// loading or signed out travels in `?from=` and is opened once the user may see it.
@visibleForTesting
String? authRedirect({required Uri uri, required SessionStatus session, required bool onboardingSeen}) {
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
    SessionStatus.signedIn => inLogin || gate ? (from ?? Routes.home) : null,
    SessionStatus.unknown => null,
  };
}
