import 'package:flutter/material.dart';
import 'package:material_design_icons_flutter/material_design_icons_flutter.dart';
import 'package:moviepilot_app/theme/app_theme.dart';
import 'screens/media_library_screen.dart';
import 'screens/subscriptions_screen.dart';
import 'screens/downloads_screen.dart';
import 'screens/history_screen.dart';
import 'screens/settings_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    MediaLibraryScreen(),
    SubscriptionsScreen(),
    DownloadsScreen(),
    HistoryScreen(),
    SettingsScreen(),
  ];

  final List<NavigationDestination> _destinations = const [
    NavigationDestination(
      icon: Icon(Icons.movie_outlined),
      selectedIcon: Icon(Icons.movie_rounded),
      label: '媒体库',
    ),
    NavigationDestination(
      icon: Icon(Icons.subscriptions_outlined),
      selectedIcon: Icon(Icons.subscriptions_rounded),
      label: '订阅',
    ),
    NavigationDestination(
      icon: Icon(Icons.download_outlined),
      selectedIcon: Icon(Icons.download_rounded),
      label: '下载',
    ),
    NavigationDestination(
      icon: Icon(Icons.history_outlined),
      selectedIcon: Icon(Icons.history_rounded),
      label: '历史',
    ),
    NavigationDestination(
      icon: Icon(Icons.settings_outlined),
      selectedIcon: Icon(Icons.settings_rounded),
      label: '设置',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        destinations: _destinations,
        animationDuration: const Duration(milliseconds: 300),
      ),
    );
  }
}
