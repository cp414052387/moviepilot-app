import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:moviepilot_app/api/moviepilot_api.dart';
import 'package:moviepilot_app/theme/app_theme.dart';

class HistoryScreen extends ConsumerStatefulWidget {
  const HistoryScreen({super.key});

  @override
  ConsumerState<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends ConsumerState<HistoryScreen> {
  List<dynamic> _history = [];
  List<dynamic> _transferHistory = [];
  bool _isLoading = true;
  int _currentIndex = 0;

  final List<String> _tabs = ['订阅历史', '整理历史'];

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    setState(() => _isLoading = true);

    try {
      final api = ref.read(apiProvider);

      if (_currentIndex == 0) {
        final data = await api.getSubscribeHistory();
        setState(() {
          _history = data;
          _transferHistory.clear();
          _isLoading = false;
        });
      } else {
        final data = await api.getTransferHistory();
        setState(() {
          _transferHistory = data;
          _history.clear();
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('加载失败: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('历史记录'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadHistory,
          ),
        ],
      ),
      body: Column(
        children: [
          // Tabs
          Container(
            color: Theme.of(context).colorScheme.surface,
            child: Row(
              children: List.generate(
                _tabs.length,
                (index) => Expanded(
                  child: InkWell(
                    onTap: () {
                      if (_currentIndex != index) {
                        setState(() {
                          _currentIndex = index;
                        });
                        _loadHistory();
                      }
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        border: Border(
                          bottom: BorderSide(
                            color: _currentIndex == index
                                ? AppTheme.primaryColor
                                : Colors.transparent,
                            width: 2,
                          ),
                        ),
                      ),
                      child: Text(
                        _tabs[index],
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: _currentIndex == index
                              ? AppTheme.primaryColor
                              : Colors.grey[600],
                          fontWeight: _currentIndex == index
                              ? FontWeight.bold
                              : FontWeight.normal,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
          // Content
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _currentIndex == 0
                    ? _buildSubscribeHistory()
                    : _buildTransferHistory(),
          ),
        ],
      ),
    );
  }

  Widget _buildSubscribeHistory() {
    final history = _history;

    if (history.isEmpty) {
      return _buildEmpty('暂无订阅历史');
    }

    return RefreshIndicator(
      onRefresh: _loadHistory,
      child: ListView.separated(
        padding: const EdgeInsets.all(12),
        itemCount: history.length,
        separatorBuilder: (context, index) => const Divider(height: 1),
        itemBuilder: (context, index) {
          return _SubscribeHistoryTile(item: history[index]);
        },
      ),
    );
  }

  Widget _buildTransferHistory() {
    final history = _transferHistory;

    if (history.isEmpty) {
      return _buildEmpty('暂无整理历史');
    }

    return RefreshIndicator(
      onRefresh: _loadHistory,
      child: ListView.separated(
        padding: const EdgeInsets.all(12),
        itemCount: history.length,
        separatorBuilder: (context, index) => const Divider(height: 1),
        itemBuilder: (context, index) {
          return _TransferHistoryTile(item: history[index]);
        },
      ),
    );
  }

  Widget _buildEmpty(String message) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.history_outlined,
            size: 80,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            message,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: Colors.grey[600],
                ),
          ),
        ],
      ),
    );
  }
}

class _SubscribeHistoryTile extends StatelessWidget {
  final Map<String, dynamic> item;

  const _SubscribeHistoryTile({required this.item});

  @override
  Widget build(BuildContext context) {
    final title = item['title'] ?? item['name'] ?? '未知';
    final year = item['year']?.toString();
    final type = item['type'] ?? '';
    final status = item['status'] ?? '';
    final date = item['date'] ?? item['create_time'];

    final statusColor = switch (status.toLowerCase()) {
      'completed' || 'success' => AppTheme.success,
      'failed' || 'error' => AppTheme.error,
      'downloading' => AppTheme.primaryColor,
      _ => Colors.grey,
    };

    final statusText = switch (status.toLowerCase()) {
      'completed' => '已完成',
      'failed' => '失败',
      'downloading' => '下载中',
      _ => status,
    };

    return ListTile(
      leading: CircleAvatar(
        backgroundColor: statusColor.withOpacity(0.2),
        child: Icon(
          type == '电视剧' || type == 'tv' ? Icons.tv : Icons.movie,
          color: statusColor,
        ),
      ),
      title: Text(title),
      subtitle: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 4),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  statusText,
                  style: TextStyle(
                    color: statusColor,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              if (year != null && year!.isNotEmpty) ...[
                const SizedBox(width: 8),
                Text(year!),
              ],
              if (type != null && type!.isNotEmpty) ...[
                const SizedBox(width: 8),
                Chip(
                  label: Text(type),
                  visualDensity: VisualDensity.compact,
                ),
              ],
            ],
          ),
          if (date != null) ...[
            const SizedBox(height: 4),
            Text(
              date is String && date.length > 16
                  ? date.substring(0, 16)
                  : date.toString(),
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey[600],
                  ),
            ),
          ],
        ],
      ),
      trailing: Icon(Icons.chevron_right, color: Colors.grey[400]),
    );
  }
}

class _TransferHistoryTile extends StatelessWidget {
  final Map<String, dynamic> item;

  const _TransferHistoryTile({required this.item});

  @override
  Widget build(BuildContext context) {
    final title = item['title'] ?? item['name'] ?? '未知';
    final source = item['source'] ?? item['source_path'] ?? '';
    final dest = item['dest'] ?? item['dest_path'] ?? '';
    final status = item['status'] ?? '';
    final date = item['date'] ?? item['create_time'];

    final statusColor = switch (status.toLowerCase()) {
      'success' || 'completed' => AppTheme.success,
      'failed' || 'error' => AppTheme.error,
      'transferring' || 'processing' => AppTheme.primaryColor,
      _ => Colors.grey,
    };

    final statusText = switch (status.toLowerCase()) {
      'success' || 'completed' => '成功',
      'failed' || 'error' => '失败',
      'transferring' || 'processing' => '整理中',
      _ => status,
    };

    return ListTile(
      leading: CircleAvatar(
        backgroundColor: statusColor.withOpacity(0.2),
        child: Icon(
          Icons.drive_file_move,
          color: statusColor,
        ),
      ),
      title: Text(title),
      subtitle: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 4),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  statusText,
                  style: TextStyle(
                    color: statusColor,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          if (source != null && source!.isNotEmpty) ...[
            const SizedBox(height: 4),
            Row(
              children: [
                Icon(Icons.folder_outlined, size: 14, color: Colors.grey[600]),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    source!,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ),
              ],
            ),
          ],
          if (dest != null && dest!.isNotEmpty) ...[
            const SizedBox(height: 4),
            Row(
              children: [
                Icon(Icons.arrow_downward, size: 14, color: AppTheme.primaryColor),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    dest!,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ),
              ],
            ),
          ],
          if (date != null) ...[
            const SizedBox(height: 4),
            Text(
              date is String && date.length > 16
                  ? date.substring(0, 16)
                  : date.toString(),
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey[600],
                  ),
            ),
          ],
        ],
      ),
      trailing: Icon(Icons.chevron_right, color: Colors.grey[400]),
    );
  }
}
