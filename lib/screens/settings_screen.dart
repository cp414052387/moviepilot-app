import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:moviepilot_app/providers/settings_provider.dart';
import 'package:moviepilot_app/theme/app_theme.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  @override
  Widget build(BuildContext context) {
    final settings = ref.watch(settingsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('设置'),
      ),
      body: ListView(
        children: [
          // API 设置
          _buildSectionHeader('API 设置'),
          _buildApiSettings(settings),

          const Divider(height: 32),

          // 外观设置
          _buildSectionHeader('外观'),
          _buildAppearanceSettings(settings),

          const Divider(height: 32),

          // 自动刷新设置
          _buildSectionHeader('自动刷新'),
          _buildRefreshSettings(settings),

          const Divider(height: 32),

          // 通知设置
          _buildSectionHeader('通知'),
          _buildNotificationSettings(settings),

          const Divider(height: 32),

          // 关于
          _buildSectionHeader('关于'),
          _buildAboutSection(),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: Text(
        title.toUpperCase(),
        style: Theme.of(context).textTheme.titleSmall?.copyWith(
              color: AppTheme.primaryColor,
              fontWeight: FontWeight.bold,
              letterSpacing: 1,
            ),
      ),
    );
  }

  Widget _buildApiSettings(AppSettings settings) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: [
          ListTile(
            leading: const Icon(Icons.link),
            title: const Text('API 地址'),
            subtitle: Text(
              settings.apiBaseUrl.isNotEmpty
                  ? settings.apiBaseUrl
                  : '未配置',
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => _showApiUrlDialog(settings),
          ),
          ListTile(
            leading: const Icon(Icons.key),
            title: const Text('API Key'),
            subtitle: Text(
              settings.apiKey.isNotEmpty
                  ? '已配置 (${settings.apiKey.substring(0, 8)}...)'
                  : '未配置',
            ),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => _showApiKeyDialog(settings),
          ),
        ],
      ),
    );
  }

  Widget _buildAppearanceSettings(AppSettings settings) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      child: ListTile(
        leading: const Icon(Icons.brightness_6),
        title: const Text('主题模式'),
        subtitle: _getThemeModeText(settings.themeMode),
        trailing: const Icon(Icons.chevron_right),
        onTap: () => _showThemeModeDialog(settings),
      ),
    );
  }

  Widget _buildRefreshSettings(AppSettings settings) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: [
          SwitchListTile(
            secondary: const Icon(Icons.refresh),
            title: const Text('自动刷新'),
            subtitle: const Text('定时获取最新数据'),
            value: settings.autoRefresh,
            onChanged: (value) async {
              await ref.read(settingsProvider.notifier).saveSettings(
                    settings.copyWith(autoRefresh: value),
                  );
            },
          ),
          if (settings.autoRefresh)
            ListTile(
              leading: const Icon(Icons.timer),
              title: const Text('刷新间隔'),
              subtitle: Text('${settings.refreshInterval} 秒'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => _showRefreshIntervalDialog(settings),
            ),
        ],
      ),
    );
  }

  Widget _buildNotificationSettings(AppSettings settings) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      child: SwitchListTile(
        secondary: const Icon(Icons.notifications),
        title: const Text('推送通知'),
        subtitle: const Text('下载完成等事件通知'),
        value: settings.showNotifications,
        onChanged: (value) async {
          await ref.read(settingsProvider.notifier).saveSettings(
                settings.copyWith(showNotifications: value),
              );
        },
      ),
    );
  }

  Widget _buildAboutSection() {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: [
          ListTile(
            leading: const Icon(Icons.info_outline),
            title: const Text('版本'),
            subtitle: const Text('1.0.0'),
          ),
          ListTile(
            leading: const Icon(Icons.code),
            title: const Text('开源许可'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => showLicensePage(context: context),
          ),
          ListTile(
            leading: const Icon(Icons.movie_filter_rounded),
            title: const Text('MoviePilot 官网'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              // TODO: 打开 MoviePilot 官网
            },
          ),
        ],
      ),
    );
  }

  String _getThemeModeText(ThemeMode mode) {
    switch (mode) {
      case ThemeMode.light:
        return '浅色';
      case ThemeMode.dark:
        return '深色';
      case ThemeMode.system:
        return '跟随系统';
    }
  }

  Future<void> _showApiUrlDialog(AppSettings settings) async {
    final controller = TextEditingController(text: settings.apiBaseUrl);

    final result = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('API 地址'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            hintText: 'http://192.168.1.100:3001',
          ),
          autocorrect: false,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('取消'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, controller.text.trim()),
            child: const Text('保存'),
          ),
        ],
      ),
    );

    if (result != null) {
      await ref.read(settingsProvider.notifier).saveSettings(
            settings.copyWith(apiBaseUrl: result),
          );
    }
  }

  Future<void> _showApiKeyDialog(AppSettings settings) async {
    final controller = TextEditingController(text: settings.apiKey);
    bool obscureText = true;

    await showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('API Key'),
          content: TextField(
            controller: controller,
            obscureText: obscureText,
            decoration: InputDecoration(
              hintText: '如果需要认证请输入',
              suffixIcon: IconButton(
                icon: Icon(obscureText ? Icons.visibility : Icons.visibility_off),
                onPressed: () {
                  setDialogState(() => obscureText = !obscureText);
                },
              ),
            ),
            autocorrect: false,
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('取消'),
            ),
            FilledButton(
              onPressed: () async {
                await ref.read(settingsProvider.notifier).saveSettings(
                      settings.copyWith(apiKey: controller.text.trim()),
                    );
                if (context.mounted) {
                  Navigator.pop(context);
                }
              },
              child: const Text('保存'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _showThemeModeDialog(AppSettings settings) async {
    final selected = await showDialog<ThemeMode>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('主题模式'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            RadioListTile<ThemeMode>(
              title: const Text('跟随系统'),
              value: ThemeMode.system,
              groupValue: settings.themeMode,
              onChanged: (value) => Navigator.pop(context, value),
            ),
            RadioListTile<ThemeMode>(
              title: const Text('浅色'),
              value: ThemeMode.light,
              groupValue: settings.themeMode,
              onChanged: (value) => Navigator.pop(context, value),
            ),
            RadioListTile<ThemeMode>(
              title: const Text('深色'),
              value: ThemeMode.dark,
              groupValue: settings.themeMode,
              onChanged: (value) => Navigator.pop(context, value),
            ),
          ],
        ),
      ),
    );

    if (selected != null) {
      await ref.read(settingsProvider.notifier).saveSettings(
            settings.copyWith(themeMode: selected),
          );
    }
  }

  Future<void> _showRefreshIntervalDialog(AppSettings settings) async {
    final selected = await showDialog<int>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('刷新间隔'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            RadioListTile<int>(
              title: const Text('10 秒'),
              value: 10,
              groupValue: settings.refreshInterval,
              onChanged: (value) => Navigator.pop(context, value),
            ),
            RadioListTile<int>(
              title: const Text('30 秒'),
              value: 30,
              groupValue: settings.refreshInterval,
              onChanged: (value) => Navigator.pop(context, value),
            ),
            RadioListTile<int>(
              title: const Text('60 秒'),
              value: 60,
              groupValue: settings.refreshInterval,
              onChanged: (value) => Navigator.pop(context, value),
            ),
            RadioListTile<int>(
              title: const Text('120 秒'),
              value: 120,
              groupValue: settings.refreshInterval,
              onChanged: (value) => Navigator.pop(context, value),
            ),
          ],
        ),
      ),
    );

    if (selected != null) {
      await ref.read(settingsProvider.notifier).saveSettings(
            settings.copyWith(refreshInterval: selected),
          );
    }
  }
}
