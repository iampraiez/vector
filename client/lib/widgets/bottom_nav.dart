import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/colors.dart';

class AppBottomNav extends StatelessWidget {
  const AppBottomNav({super.key});

  @override
  Widget build(BuildContext context) {
    // In a full app, this would use StatefulShellRoute from go_router
    // For now we just implement the UI stub based on the generic concept.
    final String location = GoRouterState.of(context).matchedLocation;
    
    int currentIndex = 0;
    if (location.startsWith('/assignments')) currentIndex = 1;
    if (location.startsWith('/history')) currentIndex = 2;
    if (location.startsWith('/profile')) currentIndex = 3;

    return BottomNavigationBar(
      currentIndex: currentIndex,
      onTap: (index) {
        switch (index) {
          case 0: context.go('/home'); break;
          case 1: context.go('/assignments'); break;
          case 2: context.go('/history'); break; // History is typically tab 3
          case 3: context.go('/profile'); break; // Profile is typically tab 4
        }
      },
      type: BottomNavigationBarType.fixed,
      selectedItemColor: AppColors.primary,
      unselectedItemColor: AppColors.textHint,
      selectedFontSize: 11,
      unselectedFontSize: 11,
      backgroundColor: AppColors.white,
      items: const [
        BottomNavigationBarItem(
          icon: Icon(Icons.home_outlined),
          activeIcon: Icon(Icons.home),
          label: 'Home',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.list_alt_outlined),
          activeIcon: Icon(Icons.list_alt),
          label: 'Assignments',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.history_outlined),
          activeIcon: Icon(Icons.history),
          label: 'History',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.person_outline),
          activeIcon: Icon(Icons.person),
          label: 'Profile',
        ),
      ],
    );
  }
}
