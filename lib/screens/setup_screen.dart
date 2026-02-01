import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:moviepilot_app/providers/settings_provider.dart';
import 'package:moviepilot_app/theme/app_theme.dart';

class SetupScreen extends ConsumerStatefulWidget {
  const SetupScreen({super.key});

  @override
  ConsumerState<SetupScreen> createState() => _SetupScreenState();
}

class _SetupScreenState extends ConsumerState<SetupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _baseUrlController = TextEditingController();
  final _apiKeyController = TextEditingController();

  bool _isLoading = false;
  bool _testSuccess = false;
  String? _errorMessage;

  @override
  void dispose() {
    _baseUrlController.dispose();
    _apiKeyController.dispose();
    super.dispose();
  }

  Future<void> _testConnection() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _testSuccess = false;
    });

    // 这里应该调用 API 测试连接
    // 暂时模拟测试
    await Future.delayed(const Duration(seconds: 1));

    setState(() {
      _isLoading = false;
      _testSuccess = true;
    });

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('连接成功！'),
          backgroundColor: AppTheme.success,
        ),
      );
    }
  }

  Future<void> _saveAndContinue() async {
    if (!_formKey.currentState!.validate()) return;

    if (!_testSuccess) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('请先测试连接'),
          backgroundColor: AppTheme.warning,
        ),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    final settings = ref.read(settingsProvider);
    await ref.read(settingsProvider.notifier).saveSettings(
          settings.copyWith(
            apiBaseUrl: _baseUrlController.text.trim(),
            apiKey: _apiKeyController.text.trim(),
          ),
        );

    setState(() {
      _isLoading = false;
    });

    if (mounted) {
      // 重新启动应用以应用设置
      Navigator.of(context).pushReplacementNamed('/');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 500),
              child: Form(
                key: _formKey,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Logo
                    Icon(
                      Icons.movie_filter_rounded,
                      size: 100,
                      color: AppTheme.primaryColor,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'MoviePilot',
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'NAS 媒体库控制器',
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                            color: Theme.of(context).colorScheme.secondary,
                          ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 48),

                    // API URL 输入
                    TextFormField(
                      controller: _baseUrlController,
                      decoration: const InputDecoration(
                        labelText: 'API 地址',
                        hintText: 'http://192.168.1.100:3001',
                        prefixIcon: Icon(Icons.link),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return '请输入 API 地址';
                        }
                        final url = Uri.tryParse(value);
                        if (url == null || !url.hasScheme) {
                          return '请输入有效的 URL';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // API Key 输入（可选）
                    TextFormField(
                      controller: _apiKeyController,
                      decoration: const InputDecoration(
                        labelText: 'API Key（可选）',
                        hintText: '如果需要认证请输入',
                        prefixIcon: Icon(Icons.key),
                      ),
                      obscureText: true,
                    ),
                    const SizedBox(height: 16),

                    // 测试连接按钮
                    ElevatedButton.icon(
                      onPressed: _isLoading ? null : _testConnection,
                      icon: _isLoading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Icon(Icons.wifi),
                      label: const Text('测试连接'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryColor,
                        foregroundColor: Colors.white,
                      ),
                    ),
                    if (_testSuccess) ...[
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppTheme.success.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppTheme.success),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.check_circle,
                              color: AppTheme.success,
                            ),
                            const SizedBox(width: 8),
                            const Text('连接成功'),
                          ],
                        ),
                      ),
                    ],
                    if (_errorMessage != null) ...[
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppTheme.error.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppTheme.error),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.error,
                              color: AppTheme.error,
                            ),
                            const SizedBox(width: 8),
                            Expanded(child: Text(_errorMessage!)),
                          ],
                        ),
                      ),
                    ],
                    const SizedBox(height: 24),

                    // 保存并继续按钮
                    ElevatedButton(
                      onPressed: _isLoading ? null : _saveAndContinue,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryColor,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: _isLoading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Text('保存并继续'),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
