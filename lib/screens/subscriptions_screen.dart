import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:moviepilot_app/api/moviepilot_api.dart';
import 'package:moviepilot_app/models/media.dart';
import 'package:moviepilot_app/theme/app_theme.dart';

class SubscriptionsScreen extends ConsumerStatefulWidget {
  const SubscriptionsScreen({super.key});

  @override
  ConsumerState<SubscriptionsScreen> createState() => _SubscriptionsScreenState();
}

class _SubscriptionsScreenState extends ConsumerState<SubscriptionsScreen> {
  List<Subscription> _subscriptions = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadSubscriptions();
  }

  Future<void> _loadSubscriptions() async {
    setState(() => _isLoading = true);

    try {
      final api = ref.read(apiProvider);
      final data = await api.getSubscriptions();
      setState(() {
        _subscriptions = data;
        _isLoading = false;
      });
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
        title: const Text('订阅管理'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadSubscriptions,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showAddSubscriptionDialog,
        icon: const Icon(Icons.add),
        label: const Text('添加订阅'),
        backgroundColor: AppTheme.primaryColor,
        foregroundColor: Colors.white,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _subscriptions.isEmpty
              ? _buildEmpty()
              : RefreshIndicator(
                  onRefresh: _loadSubscriptions,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(12),
                    itemCount: _subscriptions.length,
                    itemBuilder: (context, index) {
                      return _SubscriptionCard(
                        subscription: _subscriptions[index],
                        onDelete: () => _deleteSubscription(_subscriptions[index].id),
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
            Icons.subscriptions_outlined,
            size: 80,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            '暂无订阅',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: Colors.grey[600],
                ),
          ),
          const SizedBox(height: 8),
          Text(
            '点击 + 添加新订阅',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.grey[500],
                ),
          ),
        ],
      ),
    );
  }

  Future<void> _showAddSubscriptionDialog() async {
    final nameController = TextEditingController();
    final yearController = TextEditingController();
    final seasonController = TextEditingController();
    final tmdbIdController = TextEditingController();
    String type = '电影';

    await showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('添加订阅'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameController,
                decoration: const InputDecoration(
                  labelText: '名称 *',
                  hintText: '电影或剧集名称',
                ),
              ),
              const SizedBox(height: 12),
              SegmentedButton<String>(
                segments: const [
                  ButtonSegment(
                    value: '电影',
                    label: Text('电影'),
                  ),
                  ButtonSegment(
                    value: '电视剧',
                    label: Text('剧集'),
                  ),
                ],
                selected: {type},
                onSelectionChanged: (Set<String> newSelection) {
                  setDialogState(() {
                    type = newSelection.first;
                  });
                },
              ),
              const SizedBox(height: 12),
              TextField(
                controller: yearController,
                decoration: const InputDecoration(
                  labelText: '年份',
                  hintText: '如不填写将自动搜索',
                ),
                keyboardType: TextInputType.number,
              ),
              if (type == '电视剧') ...[
                const SizedBox(height: 12),
                TextField(
                  controller: seasonController,
                  decoration: const InputDecoration(
                    labelText: '季数',
                  ),
                  keyboardType: TextInputType.number,
                ),
              ],
              const SizedBox(height: 12),
              TextField(
                controller: tmdbIdController,
                decoration: const InputDecoration(
                  labelText: 'TMDB ID',
                  hintText: '如不填写将自动搜索',
                ),
                keyboardType: TextInputType.number,
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('取消'),
            ),
            FilledButton(
              onPressed: () async {
                if (nameController.text.isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('请输入名称')),
                  );
                  return;
                }
                try {
                  final api = ref.read(apiProvider);
                  await api.addSubscription(
                    name: nameController.text,
                    type: type,
                    year: yearController.text.isEmpty
                        ? null
                        : yearController.text,
                    season: seasonController.text.isEmpty
                        ? null
                        : seasonController.text,
                    tmdbId: tmdbIdController.text.isEmpty
                        ? null
                        : int.tryParse(tmdbIdController.text),
                  );
                  if (context.mounted) {
                    Navigator.pop(context);
                    await _loadSubscriptions();
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('添加成功')),
                    );
                  }
                } catch (e) {
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('添加失败: $e')),
                    );
                  }
                }
              },
              child: const Text('添加'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _deleteSubscription(int id) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('确认删除'),
        content: const Text('确定要删除这个订阅吗？'),
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
        await api.deleteSubscription(id);
        await _loadSubscriptions();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('删除成功')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('删除失败: $e')),
          );
        }
      }
    }
  }
}

class _SubscriptionCard extends StatelessWidget {
  final Subscription subscription;
  final VoidCallback onDelete;

  const _SubscriptionCard({
    required this.subscription,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final statusColor = switch (subscription.state) {
      'R' => Colors.orange,
      'P' => Colors.grey,
      'D' => AppTheme.success,
      _ => Colors.grey,
    };

    final statusText = subscription.statusText;

    return Card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ListTile(
            leading: CircleAvatar(
              backgroundImage: NetworkImage(subscription.posterUrl),
              onBackgroundImageError: (_, __) {},
              backgroundColor: Colors.grey[300],
            ),
            title: Text(subscription.fullTitle),
            subtitle: Row(
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
                const SizedBox(width: 8),
                if (subscription.vote != null) ...[
                  const Icon(Icons.star, size: 14, color: Colors.amber),
                  const SizedBox(width: 4),
                  Text(subscription.vote!.toStringAsFixed(1)),
                ],
              ],
            ),
            trailing: PopupMenuButton<String>(
              onSelected: (value) {
                if (value == 'delete') {
                  onDelete();
                }
              },
              itemBuilder: (context) => [
                const PopupMenuItem(
                  value: 'delete',
                  child: Row(
                    children: [
                      Icon(Icons.delete, color: AppTheme.error),
                      SizedBox(width: 8),
                      Text('删除'),
                    ],
                  ),
                ),
              ],
            ),
          ),
          if (subscription.isTV && subscription.totalEpisode != null)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  LinearProgressIndicator(
                    value: subscription.totalEpisode != null && subscription.totalEpisode! > 0
                        ? subscription.downloadedEpisodes / subscription.totalEpisode!
                        : 0,
                    backgroundColor: Colors.grey[300],
                    valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primaryColor),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '已下载 ${subscription.downloadedEpisodes}/${subscription.totalEpisode} 集',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      if (subscription.lackEpisode != null &&
                          subscription.lackEpisode! > 0)
                        Text(
                          '缺 ${subscription.lackEpisode} 集',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: AppTheme.error,
                              ),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          if (subscription.lastUpdate != null)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
              child: Text(
                '最后更新: ${subscription.lastUpdate}',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Colors.grey[600],
                    ),
              ),
            ),
        ],
      ),
    );
  }
}
