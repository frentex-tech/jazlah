import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jazlah/features/auth/presentation/session_controller.dart';
import 'package:jazlah/features/profile/domain/customer_profile.dart';

/// The signed-in customer (`GET /v1/customer/me`). Invalidate after a change.
final FutureProvider<CustomerProfile> profileProvider = FutureProvider.autoDispose<CustomerProfile>(
  (ref) => ref.watch(profileRepositoryProvider).me(),
);
