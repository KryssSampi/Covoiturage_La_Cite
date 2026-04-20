import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

// ─── Config d'un filtre ────────────────────────────────────────────────────────
class FilterOption {
  FilterOption({required this.label, required this.value, this.isActive = false});
  final String label;
  final String value;
  bool isActive;
}

// ─── Config d'un tri ───────────────────────────────────────────────────────────
class SortOption {
  const SortOption({required this.label, required this.value});
  final String label;
  final String value;
}

// ─── Super-composant ──────────────────────────────────────────────────────────
class ItemListView<T> extends StatefulWidget {
  const ItemListView({
    super.key,
    required this.items,
    required this.itemBuilder,
    this.filteredItems,
    this.isLoading = false,
    this.error,
    this.searchHint = 'Rechercher…',
    this.filterOptions = const [],
    this.sortOptions = const [],
    this.onRefresh,
    this.onSearch,
    this.onFilterChanged,
    this.onSortChanged,
    this.emptyTitle = 'Aucun résultat',
    this.emptySubtitle = 'Modifiez vos critères de recherche.',
    this.emptyIcon = Icons.search_off_rounded,
    this.shimmerCount = 5,
    this.padding,
    this.headerSliver,
    this.tabs,
    this.activeTabIndex = 0,
    this.onTabChanged,
  });

  final List<T> items;
  final Widget Function(T item) itemBuilder;
  final List<T>? filteredItems;
  final bool isLoading;
  final String? error;
  final String searchHint;
  final List<FilterOption> filterOptions;
  final List<SortOption> sortOptions;
  final Future<void> Function()? onRefresh;
  final ValueChanged<String>? onSearch;
  final ValueChanged<FilterOption>? onFilterChanged;
  final ValueChanged<SortOption>? onSortChanged;
  final String emptyTitle;
  final String emptySubtitle;
  final IconData emptyIcon;
  final int shimmerCount;
  final EdgeInsets? padding;
  final Widget? headerSliver;
  final List<String>? tabs;
  final int activeTabIndex;
  final ValueChanged<int>? onTabChanged;

  @override
  State<ItemListView<T>> createState() => _ItemListViewState<T>();
}

class _ItemListViewState<T> extends State<ItemListView<T>> {
  late TextEditingController _searchCtrl;
  String _currentSort = '';

  @override
  void initState() {
    super.initState();
    _searchCtrl = TextEditingController();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  List<T> get _displayItems => widget.filteredItems ?? widget.items;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // ── Onglets ─────────────────────────────────────────────────
        if (widget.tabs != null && widget.tabs!.length > 1)
          _TabBar(
            tabs: widget.tabs!,
            activeIndex: widget.activeTabIndex,
            onChanged: widget.onTabChanged,
          ),

        // ── Barre recherche + filtres ────────────────────────────────
        if (widget.onSearch != null ||
            widget.filterOptions.isNotEmpty ||
            widget.sortOptions.isNotEmpty)
          _SearchFilterBar(
            searchCtrl: _searchCtrl,
            hint: widget.searchHint,
            filterOptions: widget.filterOptions,
            sortOptions: widget.sortOptions,
            currentSort: _currentSort,
            onSearch: widget.onSearch,
            onFilterChanged: widget.onFilterChanged,
            onSortChanged: (opt) {
              setState(() => _currentSort = opt.value);
              widget.onSortChanged?.call(opt);
            },
          ),

        // ── Liste ────────────────────────────────────────────────────
        Expanded(
          child: widget.isLoading
              ? _ShimmerList(count: widget.shimmerCount)
              : widget.error != null
                  ? _ErrorState(message: widget.error!)
                  : _displayItems.isEmpty
                      ? _EmptyState(
                          icon: widget.emptyIcon,
                          title: widget.emptyTitle,
                          subtitle: widget.emptySubtitle,
                        )
                      : _ItemList(
                          items: _displayItems,
                          itemBuilder: widget.itemBuilder,
                          onRefresh: widget.onRefresh,
                          padding: widget.padding,
                        ),
        ),
      ],
    );
  }
}

// ── Onglets ─────────────────────────────────────────────────────────────────────
class _TabBar extends StatelessWidget {
  const _TabBar({
    required this.tabs,
    required this.activeIndex,
    this.onChanged,
  });
  final List<String> tabs;
  final int activeIndex;
  final ValueChanged<int>? onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.surface,
      child: Row(
        children: List.generate(tabs.length, (i) {
          final isActive = i == activeIndex;
          return Expanded(
            child: GestureDetector(
              onTap: () => onChanged?.call(i),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 13),
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(
                      color: isActive ? AppColors.blueDeep : Colors.transparent,
                      width: 2,
                    ),
                  ),
                ),
                alignment: Alignment.center,
                child: Text(
                  tabs[i],
                  style: TextStyle(
                    fontFamily: 'Sora',
                    fontWeight: FontWeight.w600,
                    fontSize: 13.5,
                    color: isActive ? AppColors.blueDeep : AppColors.text3,
                  ),
                ),
              ),
            ),
          );
        }),
      ),
    );
  }
}

// ── Barre recherche + filtres ───────────────────────────────────────────────────
class _SearchFilterBar extends StatelessWidget {
  const _SearchFilterBar({
    required this.searchCtrl,
    required this.hint,
    required this.filterOptions,
    required this.sortOptions,
    required this.currentSort,
    this.onSearch,
    this.onFilterChanged,
    this.onSortChanged,
  });
  final TextEditingController searchCtrl;
  final String hint;
  final List<FilterOption> filterOptions;
  final List<SortOption> sortOptions;
  final String currentSort;
  final ValueChanged<String>? onSearch;
  final ValueChanged<FilterOption>? onFilterChanged;
  final ValueChanged<SortOption>? onSortChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.surface,
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 10),
      child: Column(
        children: [
          // Search bar
          Container(
            height: 46,
            decoration: BoxDecoration(
              color: AppColors.gray50,
              borderRadius: AppRadius.full,
              border: Border.all(color: AppColors.gray200, width: 1.5),
            ),
            child: Row(
              children: [
                const SizedBox(width: 14),
                const Icon(Icons.search_rounded, color: AppColors.gray400, size: 18),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    controller: searchCtrl,
                    onChanged: onSearch,
                    style: AppText.dmBody14,
                    decoration: InputDecoration(
                      hintText: hint,
                      hintStyle: AppText.dmBody14.copyWith(color: AppColors.gray400),
                      border: InputBorder.none,
                      isDense: true,
                    ),
                  ),
                ),
                if (searchCtrl.text.isNotEmpty)
                  GestureDetector(
                    onTap: () {
                      searchCtrl.clear();
                      onSearch?.call('');
                    },
                    child: const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 12),
                      child: Icon(Icons.close_rounded, size: 16, color: AppColors.gray400),
                    ),
                  ),
              ],
            ),
          ),
          if (filterOptions.isNotEmpty || sortOptions.isNotEmpty) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                // Filter pills
                Expanded(
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        ...filterOptions.map((opt) => Padding(
                          padding: const EdgeInsets.only(right: 6),
                          child: _FilterPill(
                            option: opt,
                            onTap: () => onFilterChanged?.call(opt),
                          ),
                        )),
                      ],
                    ),
                  ),
                ),
                // Sort button
                if (sortOptions.isNotEmpty)
                  _SortButton(
                    options: sortOptions,
                    current: currentSort,
                    onChanged: onSortChanged,
                  ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

class _FilterPill extends StatelessWidget {
  const _FilterPill({required this.option, this.onTap});
  final FilterOption option;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: option.isActive ? AppColors.blueDeep : AppColors.gray100,
          borderRadius: AppRadius.full,
          border: Border.all(
            color: option.isActive ? AppColors.blueDeep : AppColors.gray200,
          ),
        ),
        child: Text(
          option.label,
          style: TextStyle(
            fontFamily: 'DM Sans',
            fontWeight: FontWeight.w600,
            fontSize: 12,
            color: option.isActive ? Colors.white : AppColors.text3,
          ),
        ),
      ),
    );
  }
}

class _SortButton extends StatelessWidget {
  const _SortButton({
    required this.options,
    required this.current,
    this.onChanged,
  });
  final List<SortOption> options;
  final String current;
  final ValueChanged<SortOption>? onChanged;

  String get _label {
    try {
      return options.firstWhere((o) => o.value == current).label;
    } catch (_) {
      return 'Trier';
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => _showSortSheet(context),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: current.isNotEmpty ? AppColors.blueDeep : AppColors.gray100,
          borderRadius: AppRadius.sm,
        ),
        child: Row(
          children: [
            Icon(
              Icons.sort_rounded,
              size: 15,
              color: current.isNotEmpty ? Colors.white : AppColors.gray600,
            ),
            const SizedBox(width: 4),
            Text(
              _label,
              style: TextStyle(
                fontFamily: 'DM Sans',
                fontWeight: FontWeight.w600,
                fontSize: 12,
                color: current.isNotEmpty ? Colors.white : AppColors.text3,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showSortSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => Padding(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(width: 40, height: 4, decoration: BoxDecoration(color: AppColors.gray200, borderRadius: AppRadius.full)),
            const SizedBox(height: 16),
            Text('Trier par', style: AppText.soraH2),
            const SizedBox(height: 12),
            ...options.map((opt) => ListTile(
              onTap: () {
                Navigator.pop(context);
                onChanged?.call(opt);
              },
              title: Text(opt.label, style: AppText.dmBody14),
              trailing: current == opt.value
                  ? const Icon(Icons.check_rounded, color: AppColors.blueDeep)
                  : null,
            )),
          ],
        ),
      ),
    );
  }
}

// ── Liste avec pull-to-refresh ───────────────────────────────────────────────────
class _ItemList<T> extends StatelessWidget {
  const _ItemList({
    required this.items,
    required this.itemBuilder,
    this.onRefresh,
    this.padding,
  });
  final List<T> items;
  final Widget Function(T) itemBuilder;
  final Future<void> Function()? onRefresh;
  final EdgeInsets? padding;

  @override
  Widget build(BuildContext context) {
    final list = ListView.builder(
      padding: padding ?? const EdgeInsets.symmetric(vertical: 8),
      itemCount: items.length,
      itemBuilder: (_, i) => items[i] != null ? itemBuilder(items[i]) : const SizedBox.shrink(),
    );

    if (onRefresh != null) {
      return RefreshIndicator(
        onRefresh: onRefresh!,
        color: AppColors.blue,
        child: list,
      );
    }
    return list;
  }
}

// ── États vides ──────────────────────────────────────────────────────────────────
class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.icon, required this.title, required this.subtitle});
  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(color: AppColors.gray100, shape: BoxShape.circle),
              child: Icon(icon, size: 32, color: AppColors.gray400),
            ),
            const SizedBox(height: 16),
            Text(title, style: AppText.soraH2.copyWith(fontSize: 16), textAlign: TextAlign.center),
            const SizedBox(height: 8),
            Text(subtitle, style: AppText.dmBody13, textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}

class _ErrorState extends StatelessWidget {
  const _ErrorState({required this.message});
  final String message;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(color: AppColors.redLight, shape: BoxShape.circle),
              child: const Icon(Icons.wifi_off_rounded, size: 32, color: AppColors.redMid),
            ),
            const SizedBox(height: 16),
            Text('Erreur de chargement', style: AppText.soraH2.copyWith(fontSize: 16)),
            const SizedBox(height: 8),
            Text(message, style: AppText.dmBody13, textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}

// ── Shimmer loading ──────────────────────────────────────────────────────────────
class _ShimmerList extends StatefulWidget {
  const _ShimmerList({required this.count});
  final int count;

  @override
  State<_ShimmerList> createState() => _ShimmerListState();
}

class _ShimmerListState extends State<_ShimmerList> with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
    _anim = CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _anim,
      builder: (_, __) {
        final shimmerColor = Color.lerp(AppColors.gray100, AppColors.gray200, _anim.value)!;
        return ListView.builder(
          padding: const EdgeInsets.symmetric(vertical: 8),
          itemCount: widget.count,
          itemBuilder: (_, __) => _ShimmerCard(color: shimmerColor),
        );
      },
    );
  }
}

class _ShimmerCard extends StatelessWidget {
  const _ShimmerCard({required this.color});
  final Color color;

  Widget _box({double w = double.infinity, double h = 12, double r = 8}) {
    return Container(
      width: w,
      height: h,
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(r),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 5),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: AppRadius.md,
        boxShadow: AppShadows.sm,
      ),
      child: Row(
        children: [
          _box(w: 50, h: 50, r: 10),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _box(w: 140, h: 14),
                const SizedBox(height: 8),
                _box(w: 200, h: 10),
                const SizedBox(height: 6),
                _box(w: 100, h: 10),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              _box(w: 60, h: 22, r: 11),
              const SizedBox(height: 8),
              _box(w: 48, h: 14),
            ],
          ),
        ],
      ),
    );
  }
}
