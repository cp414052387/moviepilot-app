import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:moviepilot_app/api/moviepilot_api.dart';
import 'package:moviepilot_app/models/media.dart';
import 'package:moviepilot_app/theme/app_theme.dart';

class DownloadsScreen extends ConsumerStatefulWidget {
  const DownloadsScreen({super.key});

  @override
  ConsumerState<DownloadsScreen> createState() => _DownloadsScreenState();
}

class _DownloadsScreenState extends ConsumerState<DownloadsScreen> {
  List<DownloadTask> _downloads = [];
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadDownloads();
  }

  Future<void> _loadDownloads() async {
    setState(() => _isLoading = true);

    try {
      final api = ref.read(apiProvider);
      final data = await api.getDownloads();
      setState(() {
        _downloads = data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('下载任务'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadDownloads,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? _buildError()
              : _downloads.isEmpty
                  ? _buildEmpty()
                  : RefreshIndicator(
                      onRefresh: _loadDownloads,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(12),
                        itemCount: _downloads.length,
                        itemBuilder: (context, index) {
                          return _DownloadCard(
                            download: _downloads[index],
                            onRefresh: _loadDownloads,
                          );
                        },
                      ),
                    ),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.download_outlined,
            size: 80,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            '暂无下载任务',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: Colors.grey[600],
                ),
          ),
          const SizedBox(height: 8),
          Text(
            '新添加的下载会自动显示',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.grey[500],
                ),
          ),
        ],
      ),
    );
  }

  Widget _buildError() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 64,
              color: AppTheme.error,
            ),
            const SizedBox(height: 16),
            Text(
              _errorMessage ?? '加载失败',
              style: Theme.of(context).textTheme.titleMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: _loadDownloads,
              icon: const Icon(Icons.refresh),
              label: const Text('重试'),
            ),
          ],
        ),
      ),
    );
  }
}

class _DownloadCard extends ConsumerWidget {
  final DownloadTask download;
  final VoidCallback onRefresh;

  const _DownloadCard({
    required this.download,
    required this.onRefresh,
  });

  Future<void> _pauseResume(BuildContext context) async {
    try {
      final api = ref.read(apiProvider);
      // 注意：当前 MoviePilot MCP API 可能不支持暂停/继续
      // 这里预留接口
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('操作功能开发中')),
      );
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('操作失败: $e')),
        );
      }
    }
  }

  Future<void> _delete(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('确认删除'),
        content: const Text('确定要删除这个下载任务吗？'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('取消'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            style: FilledButton.styleFrom(
              backgroundColor: AppTheme.error,
            ),
            child: const Text('删除'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        final api = ref.read(apiProvider);
        if (download.hash != null) {
          await api.deleteDownload(download.hash!);
        }
        onRefresh();
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('删除成功')),
          );
        }
      } catch (e) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('删除失败: $e')),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statusColor = switch (download.status?.toLowerCase()) {
      'downloading' || 'active' => AppTheme.primaryColor,
      'paused' => Colors.orange,
      'completed' || 'finished' => AppTheme.success,
      'failed' || 'error' => AppTheme.error,
      'seeding' => Colors.purple,
      _ => Colors.grey,
    };

    final statusText = download.statusText;

    return Card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ListTile(
            leading: CircleAvatar(
              backgroundColor: statusColor.withOpacity(0.2),
              child: Icon(
                download.isDownloading
                    ? Icons.downloading
                    : download.isSeeding
                        ? Icons.cloud_upload
                        : Icons.file_download,
                color: statusColor,
              ),
            ),
            title: Text(download.title ?? '未知任务'),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (download.filename != null && download.filename!.isNotEmpty)
                  Text(download.filename!, maxLines: 1, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Text(download.formattedSize),
                    const SizedBox(width: 8),
                    if (download.speed != null && download.speed!.isNotEmpty &&
                        download.isDownloading) ...[
                      Icon(Icons.speed, size: 14, color: Colors.grey[600]),
                      const SizedBox(width: 4),
                      Text(download.speed!),
                    ],
                  ],
                ),
              ],
            ),
            trailing: _buildStatusIcon(statusText, statusColor),
          ),
          if (download.isDownloading || download.isPaused)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
              child: Column(
                children: [
                  LinearProgressIndicator(
                    value: download.progressPercent,
                    backgroundColor: Colors.grey[300],
                    valueColor: AlwaysStoppedAnimation<Color>(statusColor),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '${download.progress ?? 0}%',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      Text(
                        statusText,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: statusColor,
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                if (download.isDownloading || download.isPaused)
                  OutlinedButton.icon(
                    onPressed: () => _pauseResume(context),
                    icon: Icon(
                      download.isDownloading ? Icons.pause : Icons.play_arrow,
                    ),
                    label: Text(download.isDownloading ? '暂停' : '继续'),
                  ),
                if (!download.isCompleted && !download.isSeeding)
                  OutlinedButton.icon(
                    onPressed: () => _delete(context),
                    icon: const Icon(Icons.delete),
                    label: const Text('删除'),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusIcon(String status, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            _getStatusIcon(status),
            size: 14,
            color: color,
          ),
          const SizedBox(width: 4),
          Text(
            status,
            style: TextStyle(
              color: color,
              fontSize: 11,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  IconData _getStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case '下载中':
        return Icons.downloading;
      case '已暂停':
        return Icons.pause_circle;
      case '已完成':
        return Icons.check_circle;
      case '做种中':
        return Icons.cloud_upload;
      case '失败':
        return Icons.error;
      default:
        return Icons.help_outline;
    }
  }
}
