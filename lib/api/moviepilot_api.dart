import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:moviepilot_app/providers/settings_provider.dart';
import 'package:moviepilot_app/models/media.dart';
import 'dart:convert';

class MoviePilotAPI {
  final Dio _dio;
  final String baseUrl;

  MoviePilotAPI({required this.baseUrl, String? apiKey})
      : _dio = Dio(
          BaseOptions(
            baseUrl: baseUrl,
            connectTimeout: const Duration(seconds: 10),
            receiveTimeout: const Duration(seconds: 30),
            headers: {
              'Content-Type': 'application/json',
              if (apiKey != null && apiKey.isNotEmpty) 'X-API-KEY': apiKey!,
            },
          ),
        ) {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          print('Request: ${options.method} ${options.uri}');
          print('Data: ${options.data}');
          return handler.next(options);
        },
        onResponse: (response, handler) {
          print('Response: ${response.statusCode}');
          return handler.next(response);
        },
        onError: (error, handler) {
          print('Error: ${error.message}');
          return handler.next(error);
        },
      ),
    );
  }

  // MCP 协议调用工具
  Future<dynamic> _callTool(String toolName, {Map<String, dynamic>? arguments}) async {
    try {
      final response = await _dio.post(
        '/api/v1/mcp/tools/call',
        data: {
          'tool_name': toolName,
          'arguments': arguments ?? {},
        },
      );

      final data = response.data;
      if (data['success'] != true) {
        throw Exception(data['error'] ?? 'API 调用失败');
      }

      final result = data['result'];
      // result 通常是 JSON 字符串，需要解析
      if (result is String) {
        return jsonDecode(result);
      }
      return result;
    } catch (e) {
      throw _handleError(e);
    }
  }

  // ========== 订阅相关 ==========

  Future<List<Subscription>> getSubscriptions() async {
    final result = await _callTool('query_subscribes');
    return (result as List<dynamic>)
        .map((e) => Subscription.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> addSubscription({
    required String name,
    required String type, // '电影' or '电视剧'
    String? year,
    String? season,
    int? tmdbId,
  }) async {
    await _callTool('add_subscribe', arguments: {
      'title': name,
      'media_type': type,
      if (year != null) 'year': year,
      if (season != null) 'season': season,
      if (tmdbId != null) 'tmdbid': tmdbId,
    });
  }

  Future<void> deleteSubscription(int id) async {
    await _callTool('delete_subscribe', arguments: {
      'subscribe_id': id,
    });
  }

  Future<void> updateSubscription({
    required int id,
    String? name,
    String? year,
    String? season,
    int? tmdbId,
  }) async {
    await _callTool('update_subscribe', arguments: {
      'subscribe_id': id,
      if (name != null) 'name': name,
      if (year != null) 'year': year,
      if (season != null) 'season': season,
      if (tmdbId != null) 'tmdbid': tmdbId,
    });
  }

  // ========== 下载相关 ==========

  Future<List<DownloadTask>> getDownloads() async {
    final result = await _callTool('query_download_tasks');
    if (result == '未找到相关下载任务') {
      return [];
    }
    return (result as List<dynamic>)
        .map((e) => DownloadTask.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> addDownload({
    required String url,
    String? savePath,
  }) async {
    await _callTool('add_download', arguments: {
      'torrent_url': url,
      if (savePath != null) 'save_path': savePath,
    });
  }

  Future<void> deleteDownload(String hash) async {
    await _callTool('delete_download', arguments: {
      'download_hash': hash,
    });
  }

  // ========== 媒体相关 ==========

  Future<List<dynamic>> getRecommendations() async {
    return await _callTool('get_recommendations');
  }

  Future<List<dynamic>> searchMedia({
    required String title,
    String? year,
    String? mediaType,
    String? season,
  }) async {
    return await _callTool('search_media', arguments: {
      'explanation': '搜索媒体资源',
      'title': title,
      if (year != null) 'year': year,
      if (mediaType != null) 'media_type': mediaType,
      if (season != null) 'season': season,
    });
  }

  Future<Map<String, dynamic>> getMediaDetail({
    required int tmdbId,
    required String mediaType,
  }) async {
    return await _callTool('query_media_detail', arguments: {
      'tmdbid': tmdbId,
      'media_type': mediaType,
    });
  }

  // ========== 历史记录 ==========

  Future<List<dynamic>> getSubscribeHistory({int page = 1}) async {
    return await _callTool('query_subscribe_history');
  }

  Future<List<dynamic>> getTransferHistory() async {
    return await _callTool('query_transfer_history');
  }

  // ========== 站点相关 ==========

  Future<List<dynamic>> getSites() async {
    return await _callTool('query_sites');
  }

  // ========== 调度任务 ==========

  Future<List<dynamic>> getSchedulers() async {
    return await _callTool('query_schedulers');
  }

  Future<void> runScheduler(int id) async {
    await _callTool('run_scheduler', arguments: {
      'scheduler_id': id,
    });
  }

  // ========== 工作流 ==========

  Future<List<dynamic>> getWorkflows() async {
    return await _callTool('query_workflows');
  }

  Future<void> runWorkflow({required int id}) async {
    await _callTool('run_workflow', arguments: {
      'workflow_id': id,
    });
  }

  // ========== 其他 ==========

  Future<List<dynamic>> getLibraryExists() async {
    return await _callTool('query_library_exists');
  }

  Future<List<dynamic>> getLibraryLatest() async {
    return await _callTool('query_library_latest');
  }

  // 错误处理
  Exception _handleError(dynamic error) {
    if (error is DioException) {
      switch (error.type) {
        case DioExceptionType.connectionTimeout:
        case DioExceptionType.sendTimeout:
        case DioExceptionType.receiveTimeout:
          return Exception('连接超时，请检查网络连接');
        case DioExceptionType.connectionError:
          return Exception('网络连接失败，请检查服务器地址');
        case DioExceptionType.badResponse:
          final statusCode = error.response?.statusCode;
          if (statusCode == 401) {
            return Exception('认证失败，请检查 API Key');
          } else if (statusCode == 404) {
            return Exception('请求的资源不存在');
          } else if (statusCode == 500) {
            return Exception('服务器错误');
          }
          return Exception('请求失败: $statusCode');
        default:
          return Exception('未知错误: ${error.message}');
      }
    }
    return Exception('发生错误: $error');
  }
}

// Provider
final apiProvider = Provider<MoviePilotAPI>((ref) {
  final settings = ref.watch(settingsProvider);
  if (settings.apiBaseUrl.isEmpty) {
    throw Exception('API Base URL not configured');
  }
  return MoviePilotAPI(
    baseUrl: settings.apiBaseUrl,
    apiKey: settings.apiKey.isNotEmpty ? settings.apiKey : null,
  );
});
