import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:jazlah/app/providers.dart';
import 'package:jazlah/core/widgets/gallery/gallery_screen.dart';
import 'package:jazlah/features/_example/presentation/example_screen.dart';

/// Routes. Deep links `jazlah://<path>` open the same paths (Info.plist URL type, Android intent filter).
/// Universal links: placeholder host in the Android manifest; iOS needs the Associated Domains
/// entitlement once the domain and the signing team exist.
final routerProvider = Provider<GoRouter>((ref) {
  final env = ref.watch(envProvider);
  return GoRouter(
    initialLocation: env.initialRoute,
    routes: [
      GoRoute(path: '/', builder: (_, _) => const ExampleScreen()),
      if (env.showGallery) GoRoute(path: '/gallery', builder: (_, _) => const GalleryScreen()),
    ],
  );
});
