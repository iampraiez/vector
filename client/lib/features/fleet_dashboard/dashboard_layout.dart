import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:client/core/theme/colors.dart';
import 'package:client/main.dart';

class DashboardLayout extends StatefulWidget {
  final Widget child;
  const DashboardLayout({super.key, required this.child});

  @override
  State<DashboardLayout> createState() => _DashboardLayoutState();
}

class _DashboardLayoutState extends State<DashboardLayout> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  final List<Map<String, dynamic>> _navItems = [
    {'path': '/dashboard', 'icon': Icons.grid_view_outlined, 'label': 'Overview'},
    {'path': '/dashboard/drivers', 'icon': Icons.people_outline, 'label': 'Drivers'},
    {'path': '/dashboard/orders', 'icon': Icons.archive_outlined, 'label': 'Orders'},
    {'path': '/dashboard/tracking', 'icon': Icons.location_on_outlined, 'label': 'Live Tracking'},
    {'path': '/dashboard/reports', 'icon': Icons.bar_chart_outlined, 'label': 'Reports'},
    {'path': '/dashboard/billing', 'icon': Icons.credit_card_outlined, 'label': 'Billing'},
    {'path': '/dashboard/notifications', 'icon': Icons.notifications_none_outlined, 'label': 'Notifications'},
    {'path': '/dashboard/settings', 'icon': Icons.settings_outlined, 'label': 'Settings'},
  ];

  bool _isActive(String path) {
    final location = GoRouterState.of(context).uri.path;
    if (path == '/dashboard') return location == '/dashboard';
    return location.startsWith(path);
  }

  void _handleNav(String path) {
    if (_scaffoldKey.currentState?.isDrawerOpen ?? false) {
      context.pop(); // close drawer
    }
    context.go(path);
  }

  Widget _buildSidebarContent() {
    return Container(
      color: AppColors.white,
      child: Column(
        children: [
          // Logo
          Container(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 20),
            decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: AppColors.divider))),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(width: 8, height: 8, decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle)),
                        const SizedBox(width: 8),
                        const Text('VECTOR', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, letterSpacing: -0.44, color: AppColors.textPrimary)),
                      ],
                    ),
                    const Padding(
                      padding: EdgeInsets.only(left: 16),
                      child: Text('FLEET DASHBOARD', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500, letterSpacing: 0.8, color: AppColors.textMuted)),
                    )
                  ],
                ),
                // Hide close button on desktop, since there isn't actually a drawer, using LayoutBuilder in build method handles showing drawer or not
              ],
            ),
          ),

          // Nav
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(12),
              children: _navItems.map((item) {
                bool active = _isActive(item['path']);
                return Container(
                  margin: const EdgeInsets.only(bottom: 2),
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: () => _handleNav(item['path']),
                      borderRadius: BorderRadius.circular(10),
                      hoverColor: active ? Colors.transparent : AppColors.surface,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        decoration: BoxDecoration(
                          color: active ? AppColors.primary : Colors.transparent,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Row(
                          children: [
                            Icon(item['icon'], size: 18, color: active ? AppColors.white : AppColors.textSecondary),
                            const SizedBox(width: 10),
                            Expanded(child: Text(item['label'], style: TextStyle(fontSize: 14, fontWeight: active ? FontWeight.w600 : FontWeight.w500, color: active ? AppColors.white : AppColors.textSecondary))),
                            if (active)
                              Container(width: 6, height: 6, decoration: const BoxDecoration(color: Color(0x99FFFFFF), shape: BoxShape.circle)),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),

          // User + Sign out
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(border: Border(top: BorderSide(color: AppColors.divider))),
            child: Column(
              children: [
                Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: () {},
                    borderRadius: BorderRadius.circular(10),
                    hoverColor: AppColors.surface,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      child: Row(
                        children: [
                          Container(
                            width: 36, height: 36,
                            decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle),
                            alignment: Alignment.center,
                            child: const Text('FM', style: TextStyle(color: AppColors.white, fontSize: 13, fontWeight: FontWeight.w600)),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Fleet Manager', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                                const Text('manager@vector.com', style: TextStyle(fontSize: 12, color: AppColors.textMuted), overflow: TextOverflow.ellipsis),
                              ],
                            ),
                          ),
                          ListenableBuilder(
                            listenable: themeController,
                            builder: (context, _) {
                              final isDark = themeController.isDarkMode;
                              return IconButton(
                                onPressed: () {
                                  themeController.setThemeMode(isDark ? ThemeMode.light : ThemeMode.dark);
                                },
                                icon: Icon(
                                  isDark ? Icons.light_mode : Icons.dark_mode,
                                  size: 18,
                                  color: AppColors.textSecondary,
                                ),
                                style: IconButton.styleFrom(
                                  padding: EdgeInsets.zero,
                                  minimumSize: const Size(32, 32),
                                ),
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () => context.go('/dashboard/signin'),
                    icon: const Icon(Icons.power_settings_new),
                    label: const Text('Sign out'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.error,
                      side: const BorderSide(color: AppColors.border),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.all(10),
                      textStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                    ).copyWith(backgroundColor: WidgetStateProperty.resolveWith<Color?>((states) => states.contains(WidgetState.hovered) ? const Color(0xFFFEF2F2) : Colors.transparent)),
                  ),
                )
              ],
            ),
          )
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        bool isDesktop = constraints.maxWidth >= 1024;
        
        return Scaffold(
          key: _scaffoldKey,
          backgroundColor: AppColors.surface,
          drawer: isDesktop ? null : Drawer(
            width: 280,
            child: _buildSidebarContent(),
          ),
          body: Row(
            children: [
              if (isDesktop)
                Container(
                  width: 252,
                  decoration: const BoxDecoration(border: Border(right: BorderSide(color: AppColors.border))),
                  child: _buildSidebarContent(),
                ),
              Expanded(
                child: Column(
                  children: [
                    if (!isDesktop)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        decoration: const BoxDecoration(color: AppColors.white, border: Border(bottom: BorderSide(color: AppColors.border)), boxShadow: [BoxShadow(color: Color(0x0F000000), blurRadius: 4, offset: Offset(0, 1))]),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            IconButton(
                              onPressed: () => _scaffoldKey.currentState?.openDrawer(),
                              icon: const Icon(Icons.menu, color: AppColors.textSecondary),
                              style: IconButton.styleFrom(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10), side: const BorderSide(color: AppColors.border))),
                            ),
                            Row(
                              children: [
                                Container(width: 7, height: 7, decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle)),
                                const SizedBox(width: 8),
                                const Text('VECTOR', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700, letterSpacing: -0.34, color: AppColors.textPrimary)),
                              ],
                            ),
                            IconButton(
                              onPressed: () => context.go('/dashboard/notifications'),
                              icon: Stack(
                                children: [
                                  const Icon(Icons.notifications_none, color: AppColors.textSecondary),
                                  Positioned(
                                    top: 2, right: 3,
                                    child: Container(width: 7, height: 7, decoration: BoxDecoration(color: AppColors.error, shape: BoxShape.circle, border: Border.all(color: AppColors.white, width: 1.5))),
                                  )
                                ],
                              ),
                              style: IconButton.styleFrom(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10), side: const BorderSide(color: AppColors.border))),
                            )
                          ],
                        ),
                      ),
                    Expanded(
                      child: widget.child,
                    )
                  ],
                ),
              )
            ],
          ),
        );
      },
    );
  }
}
