import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AppSettings {
  final String apiBaseUrl;
  final String apiKey;
  final ThemeMode themeMode;
  final bool autoRefresh;
  final int refreshInterval;
  final bool showNotifications;

  AppSettings({
    this.apiBaseUrl = '',
    this.apiKey = '',
    this.themeMode = ThemeMode.system,
    this.autoRefresh = true,
    this.refreshInterval = 30,
    this.showNotifications = true,
  });

  AppSettings copyWith({
    String? apiBaseUrl,
    String? apiKey,
    ThemeMode? themeMode,
    bool? autoRefresh,
    int? refreshInterval,
    bool? showNotifications,
  }) {
    return AppSettings(
      apiBaseUrl: apiBaseUrl ?? this.apiBaseUrl,
      apiKey: apiKey ?? this.apiKey,
      themeMode: themeMode ?? this.themeMode,
      autoRefresh: autoRefresh ?? this.autoRefresh,
      refreshInterval: refreshInterval ?? this.refreshInterval,
      showNotifications: showNotifications ?? this.showNotifications,
    );
  }

  factory AppSettings.fromMap(Map<String, dynamic> map) {
    return AppSettings(
      apiBaseUrl: map['apiBaseUrl'] ?? '',
      apiKey: map['apiKey'] ?? '',
      themeMode: _parseThemeMode(map['themeMode']),
      autoRefresh: map['autoRefresh'] ?? true,
      refreshInterval: map['refreshInterval'] ?? 30,
      showNotifications: map['showNotifications'] ?? true,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'apiBaseUrl': apiBaseUrl,
      'apiKey': apiKey,
      'themeMode': themeMode.toString(),
      'autoRefresh': autoRefresh,
      'refreshInterval': refreshInterval,
      'showNotifications': showNotifications,
    };
  }

  static ThemeMode _parseThemeMode(String? value) {
    switch (value) {
      case 'ThemeMode.light':
        return ThemeMode.light;
      case 'ThemeMode.dark':
        return ThemeMode.dark;
      default:
        return ThemeMode.system;
    }
  }

  bool get isConfigured => apiBaseUrl.isNotEmpty;
}

class SettingsNotifier extends StateNotifier<AppSettings> {
  SettingsNotifier() : super(AppSettings()) {
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    final settingsMap = {
      'apiBaseUrl': prefs.getString('apiBaseUrl') ?? '',
      'apiKey': prefs.getString('apiKey') ?? '',
      'themeMode': prefs.getString('themeMode') ?? ThemeMode.system.toString(),
      'autoRefresh': prefs.getBool('autoRefresh') ?? true,
      'refreshInterval': prefs.getInt('refreshInterval') ?? 30,
      'showNotifications': prefs.getBool('showNotifications') ?? true,
    };
    state = AppSettings.fromMap(settingsMap);
  }

  Future<void> saveSettings(AppSettings newSettings) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('apiBaseUrl', newSettings.apiBaseUrl);
    await prefs.setString('apiKey', newSettings.apiKey);
    await prefs.setString('themeMode', newSettings.themeMode.toString());
    await prefs.setBool('autoRefresh', newSettings.autoRefresh);
    await prefs.setInt('refreshInterval', newSettings.refreshInterval);
    await prefs.setBool('showNotifications', newSettings.showNotifications);
    state = newSettings;
  }
}

final settingsProvider = StateNotifierProvider<SettingsNotifier, AppSettings>(
  (ref) => SettingsNotifier(),
);
