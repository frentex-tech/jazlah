import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:jazlah/app/providers.dart';
import 'package:jazlah/app/shell/home_tab.dart';
import 'package:jazlah/app/shell/main_shell.dart';
import 'package:jazlah/core/geo/geo_point.dart';
import 'package:jazlah/core/widgets/gallery/gallery_screen.dart';
import 'package:jazlah/features/auth/domain/otp_challenge.dart';
import 'package:jazlah/features/auth/presentation/complete_profile_screen.dart';
import 'package:jazlah/features/auth/presentation/onboarding_controller.dart';
import 'package:jazlah/features/auth/presentation/onboarding_screen.dart';
import 'package:jazlah/features/auth/presentation/otp_screen.dart';
import 'package:jazlah/features/auth/presentation/phone_screen.dart';
import 'package:jazlah/features/auth/presentation/session_controller.dart';
import 'package:jazlah/features/location/presentation/map_picker_screen.dart';
import 'package:jazlah/features/location/presentation/out_of_coverage_screen.dart';
import 'package:jazlah/features/profile/presentation/account_screen.dart';
import 'package:jazlah/features/profile/presentation/settings_screen.dart';

abstract final class Routes {
  static const splash = '/splash';
  static const onboarding = '/onboarding';
  static const phone = '/login';
  static const otp = '/login/otp';
  static const completeProfile = '/login/profile';
  static const home = '/home';
  static const orders = '/orders';
  static const services = '/services';
  static const account = '/account';
  static const editProfile = '/account/edit';
  static const settings = '/account/settings';
  static const reauth = '/account/settings/verify';
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
      GoRoute(
        path: Routes.outOfCoverage,
        redirect: (_, state) => state.extra is GeoPoint ? null : Routes.pickLocation,
        builder: (_, state) => OutOfCoverageScreen(point: state.extra! as GeoPoint),
      ),
      ShellRoute(
        builder: (_, state, child) => MainShell(location: state.matchedLocation, child: child),
        routes: [
          GoRoute(path: Routes.home, builder: (_, _) => const HomeTab()),
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
        ],
      ),
      if (env.showGallery) GoRoute(path: Routes.gallery, builder: (_, _) => const GalleryScreen()),
    ],
  );
});

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
