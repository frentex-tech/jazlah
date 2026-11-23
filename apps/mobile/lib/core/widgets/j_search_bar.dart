import 'package:flutter/material.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/widgets/j_icons.dart';

/// Figma `Search bar`: default / focused / filled. Magnifier at the start, filter button at the end,
/// a clear (x) button once there is text.
class JSearchBar extends StatefulWidget {
  const JSearchBar({
    required this.placeholder,
    required this.clearLabel,
    super.key,
    this.controller,
    this.focusNode,
    this.autofocus = false,
    this.onChanged,
    this.onSubmitted,
    this.onFilter,
    this.filterLabel,
    this.onTap,
  });

  final String placeholder;

  /// Semantics labels of the icon-only buttons.
  /// Null hides the filter button (the map search has none).
  final String? filterLabel;
  final String clearLabel;
  final TextEditingController? controller;
  final FocusNode? focusNode;
  final bool autofocus;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final VoidCallback? onFilter;

  /// Set: the bar is a read-only entry point (home) and a tap opens the search screen.
  final VoidCallback? onTap;

  @override
  State<JSearchBar> createState() => _JSearchBarState();
}

class _JSearchBarState extends State<JSearchBar> {
  TextEditingController? _ownController;
  FocusNode? _ownFocus;
  TextEditingController get _controller => widget.controller ?? (_ownController ??= TextEditingController());
  FocusNode get _focus => widget.focusNode ?? (_ownFocus ??= FocusNode());

  @override
  void initState() {
    super.initState();
    _controller.addListener(_rebuild);
    _focus.addListener(_rebuild);
  }

  @override
  void didUpdateWidget(JSearchBar oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.controller != widget.controller) {
      (oldWidget.controller ?? _ownController)?.removeListener(_rebuild);
      _controller.addListener(_rebuild);
    }
    if (oldWidget.focusNode != widget.focusNode) {
      (oldWidget.focusNode ?? _ownFocus)?.removeListener(_rebuild);
      _focus.addListener(_rebuild);
    }
  }

  @override
  void dispose() {
    _controller.removeListener(_rebuild);
    _focus.removeListener(_rebuild);
    _ownController?.dispose();
    _ownFocus?.dispose();
    super.dispose();
  }

  void _rebuild() => setState(() {});

  void _clear() {
    _controller.clear();
    widget.onChanged?.call('');
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 52,
      padding: const EdgeInsetsDirectional.symmetric(horizontal: JSpace.s16),
      decoration: BoxDecoration(
        color: JColors.paper,
        borderRadius: BorderRadius.circular(JRadius.md),
        border: _focus.hasFocus ? Border.all(color: JColors.ember, width: 2) : Border.all(color: JColors.line),
      ),
      child: Row(
        children: [
          const Icon(JIcons.magnifyingGlass, size: 22, color: JColors.ink2),
          const SizedBox(width: JSpace.s12),
          Expanded(
            child: TextField(
              controller: _controller,
              focusNode: _focus,
              autofocus: widget.autofocus,
              readOnly: widget.onTap != null,
              // An entry point never takes focus or opens the keyboard.
              canRequestFocus: widget.onTap == null,
              onTap: widget.onTap,
              textInputAction: TextInputAction.search,
              onChanged: widget.onChanged,
              onSubmitted: widget.onSubmitted,
              style: JText.bodyL,
              decoration: InputDecoration.collapsed(
                hintText: widget.placeholder,
                hintStyle: JText.bodyL.copyWith(color: JColors.muted),
              ),
            ),
          ),
          if (_controller.text.isNotEmpty) ...[
            const SizedBox(width: JSpace.s12),
            Semantics(
              button: true,
              label: widget.clearLabel,
              excludeSemantics: true,
              child: GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: _clear,
                child: const Icon(JIcons.x, size: 18, color: JColors.ink2),
              ),
            ),
          ],
          if (widget.filterLabel != null) ...[
            const SizedBox(width: JSpace.s12),
            Semantics(
              button: true,
              label: widget.filterLabel,
              excludeSemantics: true,
              child: GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: widget.onFilter,
                child: Container(
                  width: 36,
                  height: 36,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(color: JColors.brand, borderRadius: BorderRadius.circular(JRadius.sm)),
                  child: const Icon(JIcons.slidersHorizontal, size: 20, color: JColors.paper),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
