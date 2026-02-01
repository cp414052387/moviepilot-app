import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:moviepilot_app/api/moviepilot_api.dart';
import 'package:moviepilot_app/models/media.dart';
import 'package:moviepilot_app/theme/app_theme.dart';

class MediaLibraryScreen extends ConsumerStatefulWidget {
  const MediaLibraryScreen({super.key});

  @override
  ConsumerState<MediaLibraryScreen> createState() => _MediaLibraryScreenState();
}

class _MediaLibraryScreenState extends ConsumerState<MediaLibraryScreen> {
  List<MediaItem> _mediaList = [];
  bool _isLoading = true;
  String? _errorMessage;
  int _currentIndex = 0;

  final List<String> _tabs = ['推荐', '搜索', '最新'];

  @override
  void initState() {
    super.initState();
    _loadMedia();
  }

  Future<void> _loadMedia() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final api = ref.read(apiProvider);

      List<MediaItem> media = [];

      if (_currentIndex == 0) {
        // 推荐列表
        final result = await api.getRecommendations();
        media = (result as List<dynamic>)
            .map((e) => MediaItem.fromJson(e as Map<String, dynamic>))
            .toList();
      } else if (_currentIndex == 2) {
        // 最新入库
        final result = await api.getLibraryLatest();
        media = (result as List<dynamic>)
            .map((e) => MediaItem.fromJson(e as Map<String, dynamic>))
            .toList();
      }
      // 搜索需要用户输入

      setState(() {
        _mediaList = media;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _performSearch(String keyword) async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _mediaList.clear();
    });

    try {
      final api = ref.read(apiProvider);
      final result = await api.searchMedia(title: keyword);
      setState(() {
        _mediaList = (result as List<dynamic>)
            .map((e) => MediaItem.fromJson(e as Map<String, dynamic>))
            .toList();
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
        title: const Text('媒体库'),
        actions: [
          if (_currentIndex == 1)
            IconButton(
              icon: const Icon(Icons.search),
              onPressed: _showSearchDialog,
            ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadMedia,
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
                        if (index != 1) {
                          _loadMedia();
                        } else {
                          setState(() {
                            _mediaList.clear();
                          });
                        }
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
          Expanded(child: _buildBody()),
        ],
      ),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return _buildLoading();
    }

    if (_errorMessage != null) {
      return _buildError();
    }

    if (_mediaList.isEmpty) {
      return _buildEmpty();
    }

    return RefreshIndicator(
      onRefresh: _loadMedia,
      child: GridView.builder(
        padding: const EdgeInsets.all(12),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 0.7,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
        ),
        itemCount: _mediaList.length,
        itemBuilder: (context, index) {
          return _MediaCard(media: _mediaList[index]);
        },
      ),
    );
  }

  Widget _buildLoading() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(),
          const SizedBox(height: 16),
          Text(
            '加载中...',
            style: Theme.of(context).textTheme.bodyLarge,
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
              onPressed: _loadMedia,
              icon: const Icon(Icons.refresh),
              label: const Text('重试'),
            ),
          ],
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
            Icons.movie_outlined,
            size: 80,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            _currentIndex == 1 ? '输入关键词搜索' : '暂无内容',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: Colors.grey[600],
                ),
          ),
        ],
      ),
    );
  }

  void _showSearchDialog() {
    final searchController = TextEditingController();
    String selectedType = '';

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('搜索媒体'),
        content: StatefulBuilder(
          builder: (context, setDialogState) => Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: searchController,
                autofocus: true,
                decoration: const InputDecoration(
                  hintText: '输入电影或剧集名称',
                  prefixIcon: Icon(Icons.search),
                ),
              ),
              const SizedBox(height: 12),
              SegmentedButton<String>(
                segments: const [
                  ButtonSegment(
                    value: '',
                    label: Text('全部'),
                  ),
                  ButtonSegment(
                    value: '电影',
                    label: Text('电影'),
                  ),
                  ButtonSegment(
                    value: '电视剧',
                    label: Text('剧集'),
                  ),
                ],
                selected: {selectedType},
                onSelectionChanged: (Set<String> newSelection) {
                  setDialogState(() {
                    selectedType = newSelection.first;
                  });
                },
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('取消'),
          ),
          FilledButton(
            onPressed: () {
              Navigator.pop(context);
              if (searchController.text.isNotEmpty) {
                _performSearch(searchController.text);
              }
            },
            child: const Text('搜索'),
          ),
        ],
      ),
    );
  }
}

class _MediaCard extends StatelessWidget {
  final MediaItem media;

  const _MediaCard({required this.media});

  @override
  Widget build(BuildContext context) {
    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => _showMediaDetail(context),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Poster
            Expanded(
              child: Stack(
                fit: StackFit.expand,
                children: [
                  Image.network(
                    media.posterUrl,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        color: Colors.grey[300],
                        child: const Center(
                          child: Icon(Icons.movie, size: 48, color: Colors.grey),
                        ),
                      );
                    },
                  ),
                  if (media.isTV)
                    Positioned(
                      top: 8,
                      left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 6,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.black54,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text(
                          '剧集',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            // Info
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    media.title ?? '未知',
                    style: Theme.of(context).textTheme.titleSmall,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      if (media.voteAverage != null) ...[
                        const Icon(
                          Icons.star,
                          size: 14,
                          color: Colors.amber,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          media.voteAverage!.toStringAsFixed(1),
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                      if (media.year != null) ...[
                        const SizedBox(width: 8),
                        Text(
                          '${media.year}',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showMediaDetail(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        builder: (context, scrollController) => Container(
          decoration: BoxDecoration(
            color: Theme.of(context).scaffoldBackgroundColor,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: ListView(
            controller: scrollController,
            padding: const EdgeInsets.all(16),
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.network(
                  media.posterUrl,
                  height: 300,
                  fit: BoxFit.cover,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                media.fullTitle,
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  if (media.voteAverage != null) ...[
                    const Icon(Icons.star, color: Colors.amber),
                    const SizedBox(width: 4),
                    Text(media.voteAverage!.toStringAsFixed(1)),
                  ],
                  if (media.type != null) ...[
                    const SizedBox(width: 16),
                    Chip(label: Text(media.type!)),
                  ],
                  if (media.year != null) ...[
                    const SizedBox(width: 8),
                    Text('${media.year}'),
                  ],
                ],
              ),
              const SizedBox(height: 16),
              if (media.tmdbId != null)
                Text('TMDB ID: ${media.tmdbId}'),
              if (media.imdbId != null)
                Text('IMDB ID: ${media.imdbId}'),
              if (media.doubanId != null)
                Text('豆瓣 ID: ${media.doubanId}'),
              const SizedBox(height: 16),
              if (media.detailLink != null)
                FilledButton.icon(
                  onPressed: () {
                    // TODO: 打开链接
                  },
                  icon: const Icon(Icons.open_in_new),
                  label: const Text('在 TMDB 查看详情'),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
