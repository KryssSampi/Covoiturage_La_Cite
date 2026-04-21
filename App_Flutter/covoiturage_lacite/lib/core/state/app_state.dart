import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../fixtures/app_fixtures.dart';
import '../models/user.dart';

enum AppUserMode { passenger, driver }
enum AppNavPage { home, stats, planner, messages, profile, reservations, notifications }

class AppStateStore extends ChangeNotifier {
  AppStateStore._internal()
      : _passengerUser = User.fromJson(AppFixtures.passengerUserFixture),
        _driverUser = User.fromJson(AppFixtures.driverUserFixture);

  static final AppStateStore instance = AppStateStore._internal();

  static const bool _authenticationEnabled = false;

  User _passengerUser;
  User _driverUser;
  AppUserMode _mode = AppUserMode.driver;
  bool _usingFixtures = false;
  String? _networkIssue;
  final Map<AppNavPage, bool> _newsByPage = <AppNavPage, bool>{
    for (final AppNavPage page in AppNavPage.values) page: false,
  };

  bool get authenticationEnabled => _authenticationEnabled;
  AppUserMode get mode => _mode;
  bool get isDriver => _mode == AppUserMode.driver;
  bool get usingFixtures => _usingFixtures;
  String? get networkIssue => _networkIssue;
  bool hasNews(AppNavPage page) => _newsByPage[page] ?? false;

  User get currentUser => isDriver ? _driverUser : _passengerUser;

  void switchMode(AppUserMode mode) {
    if (_mode == mode) return;
    _mode = mode;
    notifyListeners();
  }

  void setPageHasNews(AppNavPage page, bool hasNews) {
    if ((_newsByPage[page] ?? false) == hasNews) return;
    _newsByPage[page] = hasNews;
    notifyListeners();
  }

  void clearPageNews(AppNavPage page) {
    setPageHasNews(page, false);
  }

  void clearAllNews() {
    bool changed = false;
    for (final AppNavPage page in AppNavPage.values) {
      if (_newsByPage[page] == true) {
        _newsByPage[page] = false;
        changed = true;
      }
    }
    if (changed) {
      notifyListeners();
    }
  }

  void reportFixtureFallback({
    required String endpoint,
    required String reason,
  }) {
    _usingFixtures = true;
    _networkIssue = 'Reseau indisponible ($endpoint): $reason';
    notifyListeners();
  }

  void clearFixtureFallback() {
    if (!_usingFixtures && _networkIssue == null) return;
    _usingFixtures = false;
    _networkIssue = null;
    notifyListeners();
  }

  void updateCurrentUserFromJson(Map<String, dynamic> json) {
    final User updated = User.fromJson(json);
    if (isDriver) {
      _driverUser = updated;
    } else {
      _passengerUser = updated;
    }
    notifyListeners();
  }
}

final appStateProvider = ChangeNotifierProvider<AppStateStore>((ref) {
  return AppStateStore.instance;
});
