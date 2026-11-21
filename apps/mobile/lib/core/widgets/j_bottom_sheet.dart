import 'package:flutter/material.dart';
import 'package:jazlah/app/theme/theme.dart';

/// Figma `Bottom sheet`: grip, title, content and an optional action (usually an expanded `JButton`).
class JBottomSheet extends StatelessWidget {
  const JBottomSheet({required this.child, super.key, this.title, this.action});

  final String? title;
  final Widget child;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.viewInsetsOf(context).bottom + MediaQuery.viewPaddingOf(context).bottom;
    return Container(
      width: double.infinity,
      padding: EdgeInsets.fromLTRB(JSpace.s24, JSpace.s24, JSpace.s24, JSpace.s24 + bottom),
      decoration: const BoxDecoration(
        color: JColors.paper,
        borderRadius: BorderRadius.vertical(top: Radius.circular(JRadius.lg)),
        boxShadow: JShadows.card,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(color: JColors.line, borderRadius: BorderRadius.circular(JRadius.pill)),
            ),
          ),
          if (title != null) ...[const SizedBox(height: JSpace.s16), Text(title!, style: JText.h2)],
          const SizedBox(height: JSpace.s16),
          child,
          if (action != null) ...[const SizedBox(height: JSpace.s16), action!],
        ],
      ),
    );
  }
}

/// Shows a [JBottomSheet] over the 55% scrim. Pop with a value from inside to resolve the future.
Future<T?> showJBottomSheet<T>(
  BuildContext context, {
  required WidgetBuilder builder,
  String? title,
  Widget? action,
  bool isDismissible = true,
}) {
  final direction = Directionality.of(context);
  return showModalBottomSheet<T>(
    context: context,
    isScrollControlled: true,
    isDismissible: isDismissible,
    backgroundColor: Colors.transparent,
    elevation: 0,
    barrierColor: JColors.scrim.withValues(alpha: 0.55),
    builder: (context) => Directionality(
      textDirection: direction,
      child: JBottomSheet(title: title, action: action, child: builder(context)),
    ),
  );
}
