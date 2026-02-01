class MediaItem {
  final String? title;
  final String? enTitle;
  final int? year;
  final String? type; // '电影', '电视剧'
  final String? season;
  final int? tmdbId;
  final String? imdbId;
  final String? doubanId;
  final double? voteAverage;
  final String? posterPath;
  final String? detailLink;

  MediaItem({
    this.title,
    this.enTitle,
    this.year,
    this.type,
    this.season,
    this.tmdbId,
    this.imdbId,
    this.doubanId,
    this.voteAverage,
    this.posterPath,
    this.detailLink,
  });

  factory MediaItem.fromJson(Map<String, dynamic> json) {
    return MediaItem(
      title: json['title'],
      enTitle: json['en_title'],
      year: json['year'] != null ? int.tryParse(json['year'].toString()) : null,
      type: json['type'],
      season: json['season'],
      tmdbId: json['tmdb_id'] ?? json['tmdbid'],
      imdbId: json['imdb_id'],
      doubanId: json['douban_id'] ?? json['doubanid'],
      voteAverage: json['vote_average']?.toDouble() ?? json['vote']?.toDouble(),
      posterPath: json['poster_path'] ?? json['poster'],
      detailLink: json['detail_link'],
    );
  }

  String get fullTitle {
    final parts = [title];
    if (year != null && year! > 0) {
      parts.add('($year)');
    }
    return parts.join(' ');
  }

  String get posterUrl {
    if (posterPath != null && posterPath!.isNotEmpty) {
      return posterPath!;
    }
    return 'https://via.placeholder.com/300x450?text=No+Poster';
  }

  bool get isMovie => type == '电影' || type == 'movie';
  bool get isTV => type == '电视剧' || type == 'tv';
}

class Subscription {
  final int id;
  final String name;
  final String type; // '电影', '电视剧'
  final String? year;
  final String? season;
  final int? tmdbId;
  final int? doubanId;
  final String? poster;
  final double? vote;
  final String state; // 'R' = running, etc.
  final int? totalEpisode;
  final int? lackEpisode;
  final String? lastUpdate;
  final String? username;

  Subscription({
    required this.id,
    required this.name,
    required this.type,
    this.year,
    this.season,
    this.tmdbId,
    this.doubanId,
    this.poster,
    this.vote,
    required this.state,
    this.totalEpisode,
    this.lackEpisode,
    this.lastUpdate,
    this.username,
  });

  factory Subscription.fromJson(Map<String, dynamic> json) {
    return Subscription(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      type: json['type'] ?? '',
      year: json['year']?.toString(),
      season: json['season']?.toString(),
      tmdbId: json['tmdbid'] ?? json['tmdb_id'],
      doubanId: json['doubanid'] != null ? int.tryParse(json['doubanid'].toString()) : null,
      poster: json['poster'] ?? json['poster_path'],
      vote: json['vote']?.toDouble(),
      state: json['state'] ?? '',
      totalEpisode: json['total_episode'],
      lackEpisode: json['lack_episode'],
      lastUpdate: json['last_update'],
      username: json['username'],
    );
  }

  String get fullTitle {
    final parts = [name];
    if (year != null && year!.isNotEmpty) {
      parts.add('($year)');
    }
    return parts.join(' ');
  }

  String get statusText {
    switch (state) {
      case 'R':
        return '订阅中';
      case 'P':
        return '暂停';
      case 'D':
        return '完成';
      default:
        return '未知';
    }
  }

  bool get isRunning => state == 'R';
  bool get isPaused => state == 'P';
  bool get isDone => state == 'D';

  String get posterUrl {
    if (poster != null && poster!.isNotEmpty) {
      return poster!;
    }
    return 'https://via.placeholder.com/300x450?text=No+Poster';
  }

  int get downloadedEpisodes =>
      (totalEpisode ?? 0) - (lackEpisode ?? 0);
}

class DownloadTask {
  final String? id;
  final String? hash;
  final String? title;
  final String? filename;
  final int? progress;
  final String? speed;
  final int? size;
  final String? status;
  final String? downloader;

  DownloadTask({
    this.id,
    this.hash,
    this.title,
    this.filename,
    this.progress,
    this.speed,
    this.size,
    this.status,
    this.downloader,
  });

  factory DownloadTask.fromJson(Map<String, dynamic> json) {
    return DownloadTask(
      id: json['id']?.toString(),
      hash: json['hash'] ?? json['download_hash'],
      title: json['title'] ?? json['name'],
      filename: json['filename'],
      progress: json['progress'] ?? json['percent'],
      speed: json['speed'],
      size: json['size'],
      status: json['status'] ?? json['state'],
      downloader: json['downloader'],
    );
  }

  double get progressPercent => (progress ?? 0) / 100.0;

  String get formattedSize {
    if (size == null) return 'N/A';
    final s = size!;
    if (s < 1024) return '$s B';
    if (s < 1024 * 1024) return '${(s / 1024).toStringAsFixed(1)} KB';
    if (s < 1024 * 1024 * 1024) return '${(s / (1024 * 1024)).toStringAsFixed(1)} MB';
    return '${(s / (1024 * 1024 * 1024)).toStringAsFixed(2)} GB';
  }

  String get formattedSpeed {
    if (speed == null || speed!.isEmpty) return '';
    return speed!;
  }

  bool get isDownloading => status == 'downloading' || status == 'active';
  bool get isPaused => status == 'paused';
  bool get isCompleted => status == 'completed' || status == 'finished';
  bool get isFailed => status == 'failed' || status == 'error';
  bool get isSeeding => status == 'seeding';

  String get statusText {
    if (isDownloading) return '下载中';
    if (isPaused) return '已暂停';
    if (isCompleted) return '已完成';
    if (isSeeding) return '做种中';
    if (isFailed) return '失败';
    return status ?? '未知';
  }
}

class SiteInfo {
  final String id;
  final String name;
  final String? domain;
  final String? status;
  final int? level;
  final int? upload;
  final int? download;
  final double? ratio;

  SiteInfo({
    required this.id,
    required this.name,
    this.domain,
    this.status,
    this.level,
    this.upload,
    this.download,
    this.ratio,
  });

  factory SiteInfo.fromJson(Map<String, dynamic> json) {
    return SiteInfo(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      domain: json['domain'],
      status: json['status'],
      level: json['level'],
      upload: json['upload'],
      download: json['download'],
      ratio: json['ratio']?.toDouble(),
    );
  }
}

class SchedulerInfo {
  final int id;
  final String name;
  final String? cron;
  final String? state;
  final DateTime? nextRun;
  final DateTime? lastRun;

  SchedulerInfo({
    required this.id,
    required this.name,
    this.cron,
    this.state,
    this.nextRun,
    this.lastRun,
  });

  factory SchedulerInfo.fromJson(Map<String, dynamic> json) {
    return SchedulerInfo(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      cron: json['cron'],
      state: json['state'],
      nextRun: json['next_run'] != null
          ? DateTime.tryParse(json['next_run'])
          : null,
      lastRun: json['last_run'] != null
          ? DateTime.tryParse(json['last_run'])
          : null,
    );
  }
}

class WorkflowInfo {
  final int id;
  final String name;
  final String? description;
  final String? triggerType;
  final String? state;
  final int? runCount;
  final DateTime? lastRun;

  WorkflowInfo({
    required this.id,
    required this.name,
    this.description,
    this.triggerType,
    this.state,
    this.runCount,
    this.lastRun,
  });

  factory WorkflowInfo.fromJson(Map<String, dynamic> json) {
    return WorkflowInfo(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      description: json['description'],
      triggerType: json['trigger_type'],
      state: json['state'],
      runCount: json['run_count'],
      lastRun: json['last_run'] != null
          ? DateTime.tryParse(json['last_run'])
          : null,
    );
  }
}
