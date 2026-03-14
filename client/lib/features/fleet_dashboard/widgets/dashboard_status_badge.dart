import 'package:flutter/material.dart';

enum DashboardStatusBadgeType {
  status,
  priority,
}

enum DashboardStatusBadgeSize {
  small,
  normal,
}

class DashboardStatusBadge extends StatelessWidget {
  final String label;
  final String? value;
  final DashboardStatusBadgeType type;
  final DashboardStatusBadgeSize size;

  const DashboardStatusBadge({
    super.key,
    required this.label,
    this.value,
    this.type = DashboardStatusBadgeType.status,
    this.size = DashboardStatusBadgeSize.normal,
  });

  @override
  Widget build(BuildContext context) {
    final colors = _getColors(value ?? label.toLowerCase());
    final isSmall = size == DashboardStatusBadgeSize.small;

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isSmall ? 8 : 10,
        vertical: isSmall ? 2 : 4,
      ),
      decoration: BoxDecoration(
        color: colors.background,
        borderRadius: BorderRadius.circular(6),
        border: type == DashboardStatusBadgeType.priority
            ? Border.all(color: colors.border, width: 1)
            : null,
      ),
      child: Text(
        label.toUpperCase(),
        style: TextStyle(
          fontSize: isSmall ? 9 : 10,
          fontWeight: FontWeight.w800,
          color: colors.text,
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  _BadgeColors _getColors(String val) {
    // Status Colors (Matching React's StatusBadge.tsx)
    switch (val) {
      case 'online':
      case 'active':
      case 'completed':
      case 'paid':
      case 'delivered':
        return const _BadgeColors(
          text: Color(0xFF059669),
          background: Color(0xFFECFDF5),
        );
      case 'on_route':
      case 'in_progress':
      case 'on route':
      case 'processing':
        return const _BadgeColors(
          text: Color(0xFF2563EB),
          background: Color(0xFFEFF6FF),
        );
      case 'pending':
      case 'scheduled':
      case 'inactive':
        return const _BadgeColors(
          text: Color(0xFFD97706),
          background: Color(0xFFFFFBEB),
        );
      case 'offline':
      case 'failed':
      case 'cancelled':
        return const _BadgeColors(
          text: Color(0xFFDC2626),
          background: Color(0xFFFEF2F2),
        );
      
      // Priority Colors
      case 'high':
      case 'urgent':
        return const _BadgeColors(
          text: Color(0xFFDC2626),
          background: Color(0xFFFEF2F2),
          border: Color(0xFFFCA5A5),
        );
      case 'medium':
        return const _BadgeColors(
          text: Color(0xFFD97706),
          background: Color(0xFFFFFBEB),
          border: Color(0xFFFDE68A),
        );
      case 'low':
        return const _BadgeColors(
          text: Color(0xFF059669),
          background: Color(0xFFECFDF5),
          border: Color(0xFFA7F3D0),
        );
      
      default:
        return const _BadgeColors(
          text: Color(0xFF6B7280),
          background: Color(0xFFF3F4F6),
        );
    }
  }
}

class _BadgeColors {
  final Color text;
  final Color background;
  final Color border;

  const _BadgeColors({
    required this.text,
    required this.background,
    this.border = Colors.transparent,
  });
}
