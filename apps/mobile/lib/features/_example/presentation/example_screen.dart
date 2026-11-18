import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:jazlah/app/providers.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/features/_example/data/category_repository.dart';
import 'package:jazlah/l10n/app_localizations.dart';

/// Example feature screen. Delete once the first real feature lands.
class ExampleScreen extends ConsumerWidget {
  const ExampleScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final lang = Localizations.localeOf(context).languageCode;
    final categories = ref.watch(categoriesProvider);
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.appName),
        actions: [
          if (ref.watch(envProvider).showGallery)
            IconButton(icon: const Icon(Icons.widgets_outlined), onPressed: () => context.push('/gallery')),
        ],
      ),
      body: categories.when(
        data: (items) => ListView(
          children: [for (final c in items) ListTile(title: Text(c.name(lang), style: JText.bodyL))],
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: TextButton(onPressed: () => ref.invalidate(categoriesProvider), child: Text(l10n.retry)),
        ),
      ),
    );
  }
}
