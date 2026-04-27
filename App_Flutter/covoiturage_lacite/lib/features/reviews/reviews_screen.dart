import 'package:flutter/material.dart';

import '../../core/services/api_service.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/cards/review_card.dart';
import '../../shared/widgets/item_list_view.dart';

class ReviewsScreen extends StatefulWidget {
  const ReviewsScreen({super.key});

  @override
  State<ReviewsScreen> createState() => _ReviewsScreenState();
}

class _ReviewsScreenState extends State<ReviewsScreen> {
  bool _isLoading = true;
  String? _error;
  int _activeTab = 0;
  String _searchQuery = '';
  String _sortValue = '';
  List<ReviewData> _reviews = <ReviewData>[];

  @override
  void initState() {
    super.initState();
    _load();
  }

  List<ReviewData> get _tabItems {
    return _activeTab == 0
        ? _reviews
            .where((r) => r.direction == ReviewDirection.received)
            .toList()
        : _reviews.where((r) => r.direction == ReviewDirection.given).toList();
  }

  List<ReviewData> get _filteredItems {
    var items = _tabItems;
    if (_searchQuery.isNotEmpty) {
      final q = _searchQuery.toLowerCase();
      items = items.where((r) {
        return r.personName.toLowerCase().contains(q) ||
            r.comment.toLowerCase().contains(q) ||
            r.tripRoute.toLowerCase().contains(q);
      }).toList();
    }
    if (_sortValue == 'rating_desc') {
      items = [...items]..sort((a, b) => b.rating.compareTo(a.rating));
    } else if (_sortValue == 'rating_asc') {
      items = [...items]..sort((a, b) => a.rating.compareTo(b.rating));
    }
    return items;
  }

  double get _averageRating {
    final items = _tabItems;
    if (items.isEmpty) return 0;
    return items.fold(0.0, (sum, r) => sum + r.rating) / items.length;
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final List<dynamic> results = await Future.wait([
        ApiService.instance.get('/api/reviews/received'),
        ApiService.instance.get('/api/reviews/given'),
      ]);

      final List<dynamic> received = _extractList(results[0])
          .whereType<Map<String, dynamic>>()
          .map((m) => <String, dynamic>{...m, 'direction': 'received'})
          .toList();

      final List<dynamic> given = _extractList(results[1])
          .whereType<Map<String, dynamic>>()
          .map((m) => <String, dynamic>{...m, 'direction': 'given'})
          .toList();

      if (!mounted) return;
      setState(() {
        _reviews = [...received, ...given]
            .whereType<Map<String, dynamic>>()
            .map(_mapReview)
            .toList();
        _isLoading = false;
        _error = null;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _error = e.toString();
      });
    }
  }

  Future<void> _refresh() => _load();

  ReviewData _mapReview(Map<String, dynamic> r) {
    final dynamic ratingRaw = r['rating'] ?? r['note'] ?? 0;
    final double rating = ratingRaw is num
        ? ratingRaw.toDouble()
        : double.tryParse('$ratingRaw') ?? 0;

    final Map<String, dynamic> author = r['author'] is Map<String, dynamic>
        ? r['author'] as Map<String, dynamic>
        : <String, dynamic>{};

    final String first =
        '${author['firstName'] ?? r['firstName'] ?? ''}'.trim();
    final String last = '${author['lastName'] ?? r['lastName'] ?? ''}'.trim();
    final String personName = ('$first $last').trim().isEmpty
        ? 'Utilisateur'
        : ('$first $last').trim();

    final String initials = personName
        .split(' ')
        .where((e) => e.isNotEmpty)
        .take(2)
        .map((e) => e[0].toUpperCase())
        .join();

    return ReviewData(
      id: '${r['id'] ?? ''}',
      direction: _resolveDirection(r),
      personName: personName,
      personInitials: initials.isEmpty ? 'U' : initials,
      rating: rating,
      comment: '${r['comment'] ?? r['body'] ?? ''}',
      dateLabel: '${r['dateLabel'] ?? r['createdAt'] ?? r['date'] ?? '—'}',
      tripRoute: '${r['tripRoute'] ?? r['route'] ?? r['tripLabel'] ?? '—'}',
    );
  }

  ReviewDirection _resolveDirection(Map<String, dynamic> r) {
    final String direction =
        (r['direction'] ?? r['type'] ?? '').toString().toLowerCase();
    if (direction.contains('given') ||
        direction.contains('left') ||
        direction.contains('laisse') ||
        direction.contains('sent') ||
        r['isGiven'] == true) {
      return ReviewDirection.given;
    }
    return ReviewDirection.received;
  }

  List<dynamic> _extractReviewRows(dynamic data) {
    if (data is List) return data;
    if (data is Map<String, dynamic>) {
      final dynamic body = data['data'] ?? data;
      if (body is Map<String, dynamic>) {
        final List<dynamic> merged = <dynamic>[];
        final List<dynamic> received =
            _extractList(body['received'] ?? body['reviewsReceived']);
        final List<dynamic> given =
            _extractList(body['given'] ?? body['reviewsGiven']);
        merged.addAll(received.whereType<Map<String, dynamic>>().map(
              (Map<String, dynamic> m) =>
                  <String, dynamic>{...m, 'direction': 'received'},
            ));
        merged.addAll(given.whereType<Map<String, dynamic>>().map(
              (Map<String, dynamic> m) =>
                  <String, dynamic>{...m, 'direction': 'given'},
            ));
        if (merged.isNotEmpty) return merged;
      }
      return _extractList(body);
    }
    return <dynamic>[];
  }

  List<dynamic> _extractList(dynamic data) {
    if (data is List) return data;
    if (data is Map) {
      return (data['items'] ?? data['data'] ?? data['results'] ?? <dynamic>[])
          as List<dynamic>;
    }
    return <dynamic>[];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.grayBg,
      appBar: AppBar(
        backgroundColor: AppColors.blueDeep,
        title: const Text(
          'Mes avis',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
        ),
        leading: const BackButton(color: Colors.white),
        elevation: 0,
      ),
      body: Column(
        children: [
          _ReviewsAppBar(
            averageRating: _averageRating,
            totalCount: _tabItems.length,
          ),
          Expanded(
            child: ItemListView<ReviewData>(
              items: _reviews,
              filteredItems: _filteredItems,
              isLoading: _isLoading,
              error: _error,
              searchHint: 'Rechercher un avis...',
              emptyTitle: 'Aucun avis',
              emptySubtitle:
                  'Les evaluations recues apres vos trajets apparaitront ici.',
              emptyIcon: Icons.rate_review_outlined,
              tabs: const ['Recus', 'Laisses'],
              activeTabIndex: _activeTab,
              onTabChanged: (i) => setState(() => _activeTab = i),
              sortOptions: const [
                SortOption(label: 'Plus recent', value: ''),
                SortOption(label: 'Meilleure note', value: 'rating_desc'),
                SortOption(label: 'Note croissante', value: 'rating_asc'),
              ],
              onSearch: (q) => setState(() => _searchQuery = q),
              onSortChanged: (opt) => setState(() => _sortValue = opt.value),
              onRefresh: _refresh,
              itemBuilder: (review) => ReviewCard(
                data: review,
                onTap: () => _onReviewTap(review),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _onReviewTap(ReviewData review) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.surface,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => _ReviewDetailSheet(review: review),
    );
  }
}

class _ReviewsAppBar extends StatelessWidget {
  const _ReviewsAppBar({
    required this.averageRating,
    required this.totalCount,
  });

  final double averageRating;
  final int totalCount;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.surface,
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 14),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Mes avis', style: AppText.soraH1.copyWith(fontSize: 20)),
                Text('$totalCount evaluation${totalCount != 1 ? 's' : ''}',
                    style: AppText.dmBody12),
              ],
            ),
          ),
          if (totalCount > 0)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                    colors: [AppColors.blueDeep, AppColors.blue]),
                borderRadius: AppRadius.md,
              ),
              child: Row(
                children: [
                  const Icon(Icons.star_rounded,
                      color: Color(0xFFF59E0B), size: 18),
                  const SizedBox(width: 5),
                  Text(
                    averageRating.toStringAsFixed(1),
                    style: const TextStyle(
                      fontFamily: 'Sora',
                      fontWeight: FontWeight.w700,
                      fontSize: 18,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _ReviewDetailSheet extends StatelessWidget {
  const _ReviewDetailSheet({required this.review});

  final ReviewData review;

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.55,
      minChildSize: 0.4,
      maxChildSize: 0.9,
      expand: false,
      builder: (_, ctrl) => SingleChildScrollView(
        controller: ctrl,
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                    color: AppColors.gray200, borderRadius: AppRadius.full),
              ),
            ),
            const SizedBox(height: 20),
            ReviewCard(data: review),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                  color: AppColors.blueLight, borderRadius: AppRadius.md),
              child: Row(
                children: [
                  const Icon(Icons.directions_car_rounded,
                      color: AppColors.blue, size: 20),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      review.tripRoute,
                      style:
                          AppText.dmSemi13.copyWith(color: AppColors.blueDeep),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
