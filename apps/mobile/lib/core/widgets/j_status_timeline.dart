import 'package:flutter/material.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/widgets/j_icons.dart';

/// One step of [JStatusTimeline]. [time] shows under the title once the step is reached.
class JTimelineStep {
  const JTimelineStep({required this.title, this.time});

  final String title;
  final String? time;
}

/// Figma `Status timeline` (stage=1..n): steps before [stage] are done (green check),
/// step [stage] is current (ember ring), later ones upcoming (sand). The last stage marks every step done.
class JStatusTimeline extends StatelessWidget {
  const JStatusTimeline({required this.steps, required this.stage, super.key, this.title})
    : assert(stage >= 1 && stage <= steps.length, 'stage is 1-based');

  final List<JTimelineStep> steps;
  final int stage;

  /// An H3 title inside the card, above the steps.
  final String? title;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(JSpace.s16),
      decoration: BoxDecoration(
        color: JColors.paper,
        borderRadius: BorderRadius.circular(JRadius.md),
        border: Border.all(color: JColors.line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (title != null) ...[Text(title!, style: JText.h3), const SizedBox(height: JSpace.s12)],
          for (var i = 0; i < steps.length; i++) _step(i),
        ],
      ),
    );
  }

  Widget _step(int i) {
    final last = i == steps.length - 1;
    final allDone = stage == steps.length;
    final done = i < stage - 1 || (allDone && last);
    final current = i == stage - 1 && !done;
    final reached = done || current;
    final step = steps[i];

    final Widget dot = done
        ? Container(
            width: 24,
            height: 24,
            alignment: Alignment.center,
            decoration: const BoxDecoration(color: JColors.success, shape: BoxShape.circle),
            child: const Icon(JIcons.check, size: 14, color: JColors.paper),
          )
        : current
        ? Container(
            width: 24,
            height: 24,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: JColors.paper,
              shape: BoxShape.circle,
              border: Border.all(color: JColors.ember, width: 3),
            ),
            child: Container(
              width: 8,
              height: 8,
              decoration: const BoxDecoration(color: JColors.ember, shape: BoxShape.circle),
            ),
          )
        : Container(
            width: 24,
            height: 24,
            decoration: const BoxDecoration(color: JColors.sand, shape: BoxShape.circle),
          );

    final text = Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          step.title,
          style: current ? JText.labelM : JText.bodyM.copyWith(color: reached ? JColors.ink : JColors.ink2),
        ),
        if (reached && step.time != null) ...[
          const SizedBox(height: 2),
          Text(step.time!, style: JText.caption.copyWith(color: JColors.ink2)),
        ],
      ],
    );

    // Each step but the last is 52 high: the 24 dot and a 28 connector.
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            dot,
            if (!last)
              Container(
                width: 2,
                height: 28,
                decoration: BoxDecoration(
                  color: done ? JColors.success : JColors.line,
                  borderRadius: BorderRadius.circular(1),
                ),
              ),
          ],
        ),
        const SizedBox(width: JSpace.s12),
        Flexible(
          child: ConstrainedBox(
            constraints: BoxConstraints(minHeight: last ? 24 : 52),
            child: text,
          ),
        ),
      ],
    );
  }
}
