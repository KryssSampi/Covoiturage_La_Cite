import 'dart:convert';

class AppFixtures {
  AppFixtures._();

  static bool _ready = false;
  static int _reservationSequence = 9200;
  static int _messageSequence = 5000;

  static late Map<String, dynamic> _driverUser;
  static late Map<String, dynamic> _passengerUser;
  static late Map<String, dynamic> _driverDashboard;
  static late Map<String, dynamic> _passengerDashboard;
  static late List<Map<String, dynamic>> _publishedTrips;
  static late List<Map<String, dynamic>> _driverTrips;
  static late List<Map<String, dynamic>> _passengerTrips;
  static late List<Map<String, dynamic>> _draftTrips;
  static late List<Map<String, dynamic>> _historyTrips;
  static late List<Map<String, dynamic>> _passengerReservations;
  static late Map<String, Map<String, dynamic>> _reservationById;
  static late List<Map<String, dynamic>> _conversationThreads;
  static late Map<String, List<Map<String, dynamic>>> _messagesByTrip;
  static late List<Map<String, dynamic>> _notifications;
  static late Map<String, dynamic> _favorites;
  static late Map<String, dynamic> _reviews;
  static late Map<String, dynamic> _stats;
  static late Map<String, dynamic> _finances;
  static late List<Map<String, dynamic>> _goboard;
  static late List<Map<String, dynamic>> _vehicles;

  static Map<String, dynamic> get driverUserFixture {
    _ensureReady();
    return _cloneMap(_driverUser);
  }

  static Map<String, dynamic> get passengerUserFixture {
    _ensureReady();
    return _cloneMap(_passengerUser);
  }

  static dynamic getFallback(
    String path, {
    Map<String, dynamic>? params,
    required bool isDriver,
  }) {
    _ensureReady();

    if (path == '/api/users/me') {
      return <String, dynamic>{
        'success': true,
        'data': _cloneMap(isDriver ? _driverUser : _passengerUser),
      };
    }

    if (path == '/api/dashboard/driver/me') {
      return <String, dynamic>{
        'success': true,
        'data': _cloneMap(isDriver ? _driverDashboard : _passengerDashboard),
      };
    }

    if (path == '/api/trips/search') {
      final List<Map<String, dynamic>> items = _searchTrips(params: params);
      return <String, dynamic>{
        'success': true,
        'data': <String, dynamic>{
          'items': items,
          'totalCount': items.length,
        },
      };
    }

    if (path == '/api/trips/mine/driver') {
      if (!isDriver) {
        return <String, dynamic>{'success': true, 'data': <dynamic>[]};
      }
      return <String, dynamic>{
        'success': true,
        'data': _cloneList(_driverTrips),
      };
    }

    if (path == '/api/trips/mine/passenger') {
      if (isDriver) {
        return <String, dynamic>{'success': true, 'data': <dynamic>[]};
      }
      return <String, dynamic>{
        'success': true,
        'data': _cloneList(_passengerTrips),
      };
    }

    if (path == '/api/trips/history' ||
        path == '/api/driver/historique' ||
        path == '/api/passenger/historique') {
      return <String, dynamic>{
        'success': true,
        'data': (path == '/api/driver/historique' || path == '/api/passenger/historique')
            ? <String, dynamic>{
                'items': _cloneList(_historyTrips),
                'totalCount': _historyTrips.length,
              }
            : _cloneList(_historyTrips),
      };
    }

    if (path == '/api/trips/drafts' || path == '/api/drafts') {
      return <String, dynamic>{
        'success': true,
        'data': _cloneList(_draftTrips),
      };
    }

    if (path == '/api/reservations' || path == '/api/reservations/mine') {
      return <String, dynamic>{
        'success': true,
        'data': path == '/api/reservations/mine'
            ? <String, dynamic>{
                'items': _cloneList(_passengerReservations),
                'totalCount': _passengerReservations.length,
              }
            : _cloneList(_passengerReservations),
      };
    }

    if (path == '/api/conversations' || path == '/api/messages/conversations') {
      return <String, dynamic>{
        'success': true,
        'data': _conversationItemsForRole(isDriver: isDriver),
      };
    }

    if (path == '/api/messages/unread-count') {
      int unread = 0;
      for (final List<Map<String, dynamic>> messages in _messagesByTrip.values) {
        unread += messages.where((Map<String, dynamic> m) => m['isRead'] != true).length;
      }
      return <String, dynamic>{'success': true, 'data': unread};
    }

    if (path == '/api/driver/reservation-requests') {
      return <String, dynamic>{
        'success': true,
        'data': _driverReservationRequestsEnriched(),
      };
    }

    if (path == '/api/passenger/reservations-enriched') {
      return <String, dynamic>{
        'success': true,
        'data': _passengerReservationsEnriched(),
      };
    }

    if (path == '/api/notifications') {
      return <String, dynamic>{
        'success': true,
        'data': _cloneList(_notifications),
      };
    }

    if (path == '/api/favorites') {
      return <String, dynamic>{
        'success': true,
        'data': _cloneMap(_favorites),
      };
    }

    if (path == '/api/reviews/me') {
      return <String, dynamic>{
        'success': true,
        'data': _cloneMap(_reviews),
      };
    }

    if (path == '/api/goboard/rankings') {
      return <String, dynamic>{
        'success': true,
        'data': _cloneList(_goboard),
      };
    }

    if (path == '/api/gotasks/goboard') {
      return <String, dynamic>{
        'success': true,
        'data': <String, dynamic>{
          'tasks': _cloneList(_goboard),
          'goScore': _stats['goScore'],
        },
      };
    }

    if (path == '/api/stats/me') {
      return <String, dynamic>{
        'success': true,
        'data': _cloneMap(_stats),
      };
    }

    if (path == '/api/stats/finances') {
      return <String, dynamic>{
        'success': true,
        'data': _cloneMap(_finances),
      };
    }

    if (path == '/api/finances/driver/summary') {
      return <String, dynamic>{
        'success': true,
        'data': <String, dynamic>{
          'soldeDisponible': _toDouble(_finances['availableBalance']),
          'soldeEnTransit': _toDouble(_finances['inTransit']),
          'soldePenalites': _toDouble(_finances['penalties']),
          'tauxPrelevement': _toDouble(_finances['commission']),
          'gainSemaine': _toDouble(_finances['weeklyRevenue']),
          'gainMois': _toDouble(_finances['monthlyRevenue']),
          'commissionTotale': _toDouble(_finances['commission']),
          'nbTrajetsPayants': _toInt(_stats['stats']?['paidTrips']),
          'nbPenalitesActives': 0,
          'currency': 'CAD',
        },
      };
    }

    if (path == '/api/finances/passenger/summary') {
      return <String, dynamic>{
        'success': true,
        'data': <String, dynamic>{
          'economiesEstimees': 92.0,
          'fondsEnTransit': 12.0,
          'totalDepense': 184.0,
          'nbTrajetsCompletes': 18,
          'currency': 'CAD',
        },
      };
    }

    if (path == '/api/vehicles') {
      return <String, dynamic>{
        'success': true,
        'data': _cloneList(_vehicles),
      };
    }

    if (path.startsWith('/api/trips/')) {
      final String id = path.replaceFirst('/api/trips/', '');
      if (id.isNotEmpty && !id.contains('/')) {
        final Map<String, dynamic>? trip = _findTripById(id);
        if (trip != null) {
          return <String, dynamic>{
            'success': true,
            'data': _cloneMap(trip),
          };
        }
      }
    }

    if (path.startsWith('/api/reservations/')) {
      final List<String> parts = path.split('/');
      if (parts.length >= 4) {
        final String reservationId = parts[3];
        final Map<String, dynamic>? reservation = _reservationById[reservationId];
        if (reservation != null) {
          return <String, dynamic>{
            'success': true,
            'data': _cloneMap(reservation),
          };
        }
      }
    }

    if (path.startsWith('/api/notifications/')) {
      final List<String> parts = path.split('/');
      if (parts.length >= 4) {
        final String notificationId = parts[3];
        final Map<String, dynamic>? item = _notifications
            .cast<Map<String, dynamic>?>()
            .firstWhere(
              (Map<String, dynamic>? row) => row?['id']?.toString() == notificationId,
              orElse: () => null,
            );
        if (item != null) {
          return <String, dynamic>{
            'success': true,
            'data': _cloneMap(item),
          };
        }
      }
    }

    if (path.startsWith('/api/messages/')) {
      final List<String> parts = path.split('/');
      if (parts.length >= 4) {
        final String tripId = parts[3];
        return <String, dynamic>{
          'success': true,
          'data': _cloneList(_messagesByTrip[tripId] ?? <dynamic>[]),
        };
      }
    }

    return null;
  }

  static dynamic postFallback(
    String path,
    dynamic body, {
    required bool isDriver,
  }) {
    _ensureReady();

    if (path == '/api/reservations') {
      final String tripId =
          (body is Map<String, dynamic>) ? body['tripId']?.toString() ?? '' : '';
      final Map<String, dynamic>? trip = _findTripById(tripId);
      if (trip == null) {
        return <String, dynamic>{
          'success': false,
          'message': 'Trajet introuvable',
        };
      }

      final String newReservationId = 'res_${_reservationSequence++}';
      final Map<String, dynamic> reservation = <String, dynamic>{
        'id': newReservationId,
        'tripId': tripId,
        'status': 'pending',
        'requestedSeats': 1,
        'price': _toDouble(trip['passengerPrice']),
        'driver': _cloneMap(trip['driver'] as Map<String, dynamic>),
        'trip': _cloneMap(trip),
      };

      _passengerReservations.insert(0, reservation);
      _reservationById[newReservationId] = <String, dynamic>{
        ...reservation,
        'trip': _cloneMap(trip),
      };

      final int driverTripIndex = _driverTrips.indexWhere(
        (Map<String, dynamic> row) => row['id']?.toString() == tripId,
      );
      if (driverTripIndex != -1) {
        final Map<String, dynamic> passengerPreview = <String, dynamic>{
          'id': _passengerUser['id'],
          'firstName': _passengerUser['firstName'],
          'lastName': _passengerUser['lastName'],
          'avatarUrl': _passengerUser['avatarUrl'],
          'averageRating': _passengerUser['averageRating'],
        };
        final Map<String, dynamic> request = <String, dynamic>{
          'id': newReservationId,
          'status': 'pending',
          'passenger': passengerPreview,
        };
        final List<dynamic> requests = (_driverTrips[driverTripIndex]['reservationRequests']
                as List<dynamic>? ??
            <dynamic>[]);
        requests.insert(0, request);
        _driverTrips[driverTripIndex]['reservationRequests'] = requests;
      }

      return <String, dynamic>{
        'success': true,
        'data': <String, dynamic>{'id': newReservationId},
      };
    }

    if (path.startsWith('/api/reservations/') && path.endsWith('/accept')) {
      final String id = path.split('/')[3];
      _updateReservationStatus(id, 'confirmed');
      return <String, dynamic>{'success': true};
    }

    if (path.startsWith('/api/reservations/') && path.endsWith('/refuse')) {
      final String id = path.split('/')[3];
      _updateReservationStatus(id, 'refused');
      return <String, dynamic>{'success': true};
    }

    if (path.startsWith('/api/messages/') && !path.endsWith('/broadcast')) {
      final List<String> parts = path.split('/');
      if (parts.length >= 4) {
        final String tripId = parts[3];
        final String content = (body is Map<String, dynamic>)
            ? body['content']?.toString().trim() ?? ''
            : '';
        if (content.isNotEmpty) {
          final Map<String, dynamic> message = <String, dynamic>{
            'id': 'msg_${_messageSequence++}',
            'tripId': tripId,
            'senderId': isDriver ? _driverUser['id'] : _passengerUser['id'],
            'content': content,
            'sentAt': DateTime.now().toUtc().toIso8601String(),
            'isRead': false,
          };
          final List<Map<String, dynamic>> list =
              _messagesByTrip.putIfAbsent(tripId, () => <Map<String, dynamic>>[]);
          list.add(message);
          _touchThread(tripId: tripId, content: content);
          return <String, dynamic>{'success': true, 'data': _cloneMap(message)};
        }
      }
      return <String, dynamic>{'success': true};
    }

    if (path.startsWith('/api/messages/') && path.endsWith('/broadcast')) {
      final List<String> parts = path.split('/');
      if (parts.length >= 5) {
        final String tripId = parts[3];
        final String content = (body is Map<String, dynamic>)
            ? body['content']?.toString().trim() ?? ''
            : '';
        if (content.isNotEmpty) {
          final Map<String, dynamic> message = <String, dynamic>{
            'id': 'msg_${_messageSequence++}',
            'tripId': tripId,
            'senderId': isDriver ? _driverUser['id'] : _passengerUser['id'],
            'content': '[Diffusion] $content',
            'sentAt': DateTime.now().toUtc().toIso8601String(),
            'isRead': false,
          };
          final List<Map<String, dynamic>> list =
              _messagesByTrip.putIfAbsent(tripId, () => <Map<String, dynamic>>[]);
          list.add(message);
          _touchThread(tripId: tripId, content: message['content'].toString());
        }
      }
      return <String, dynamic>{'success': true};
    }

    if (path == '/api/messages') {
      if (body is! Map<String, dynamic>) {
        return <String, dynamic>{'success': true};
      }
      final String tripId = body['tripId']?.toString() ?? '';
      final String content = body['content']?.toString().trim() ?? '';
      if (tripId.isEmpty || content.isEmpty) {
        return <String, dynamic>{'success': false, 'message': 'Message invalide'};
      }

      final Map<String, dynamic> message = <String, dynamic>{
        'id': 'msg_${_messageSequence++}',
        'tripId': tripId,
        'senderId': isDriver ? _driverUser['id'] : _passengerUser['id'],
        'content': content,
        'sentAt': DateTime.now().toUtc().toIso8601String(),
        'createdAt': DateTime.now().toUtc().toIso8601String(),
        'isRead': false,
        'type': 'text',
      };
      final List<Map<String, dynamic>> list =
          _messagesByTrip.putIfAbsent(tripId, () => <Map<String, dynamic>>[]);
      list.add(message);
      _touchThread(tripId: tripId, content: content);
      return <String, dynamic>{'success': true, 'data': _cloneMap(message)};
    }

    if (path == '/api/trips') {
      final DateTime now = DateTime.now();
      final Map<String, dynamic> payload =
          body is Map<String, dynamic> ? body : <String, dynamic>{};
      final String id = 'trip_created_${now.millisecondsSinceEpoch}';
      final DateTime departure = DateTime.tryParse(
            payload['departureTime']?.toString() ?? '',
          )?.toLocal() ??
          now.add(const Duration(hours: 3));
      final String status = payload['status']?.toString().toLowerCase() == 'draft'
          ? 'draft'
          : 'published';
      final Map<String, dynamic> trip = _buildTrip(
        id: id,
        driver: _driverPreview(_driverUser),
        departureLabel:
            payload['departureLabel']?.toString() ?? 'Campus La Cite',
        arrivalLabel:
            payload['arrivalLabel']?.toString() ?? 'Place d\'Orleans',
        departureTime: departure,
        availableSeats: _toInt(payload['availableSeats'], fallback: 2),
        totalSeats: _toInt(payload['maxPassengers'], fallback: 3),
        pricePerPassenger: _toDouble(payload['pricePerPassenger'], fallback: 7.0),
        paymentMethod: payload['paymentMethod']?.toString() ?? 'cash',
        durationMin: _toInt(payload['estimatedDurationMinutes'], fallback: 28),
        distanceKm: _toDouble(payload['estimatedDistanceKm'], fallback: 11.4),
        status: status,
        polyline: <List<double>>[
          <double>[45.4215, -75.6699],
          <double>[45.4310, -75.6400],
          <double>[45.4680, -75.5850],
        ],
      );

      if (status == 'draft') {
        _draftTrips.insert(0, _flatStatusTrip(trip, 'draft'));
      } else {
        _publishedTrips.insert(0, trip);
        _driverTrips.insert(0, _flatStatusTrip(trip, 'published'));
      }
      return <String, dynamic>{'success': true, 'data': _cloneMap(trip)};
    }

    if (path == '/api/sos') {
      return <String, dynamic>{'success': true, 'message': 'Signalement envoye'};
    }

    return null;
  }

  static dynamic patchFallback(
    String path,
    dynamic body, {
    required bool isDriver,
  }) {
    _ensureReady();

    if (path == '/api/notifications/read-all') {
      for (final Map<String, dynamic> item in _notifications) {
        item['isRead'] = true;
      }
      return <String, dynamic>{'success': true};
    }

    if (path == '/api/users/me') {
      final Map<String, dynamic> updates =
          body is Map<String, dynamic> ? body : <String, dynamic>{};
      final Map<String, dynamic> target = isDriver ? _driverUser : _passengerUser;

      void mergeNested(String key) {
        final dynamic patch = updates[key];
        if (patch is! Map<String, dynamic>) return;
        final Map<String, dynamic> current = target[key] is Map<String, dynamic>
            ? target[key] as Map<String, dynamic>
            : <String, dynamic>{};
        target[key] = <String, dynamic>{...current, ...patch};
      }

      if (updates['firstName'] != null) target['firstName'] = updates['firstName'];
      if (updates['lastName'] != null) target['lastName'] = updates['lastName'];
      if (updates['schoolRole'] != null) target['schoolRole'] = updates['schoolRole'];
      if (updates['notificationEmail'] != null) {
        target['notificationEmail'] = updates['notificationEmail'];
      }
      if (updates['phoneNumber'] != null) target['phoneNumber'] = updates['phoneNumber'];
      if (updates['bio'] != null) target['bio'] = updates['bio'];
      if (updates['languagesSpoken'] is List) {
        target['languagesSpoken'] = (updates['languagesSpoken'] as List<dynamic>)
            .map((dynamic e) => e.toString())
            .toList();
      }
      if (updates['canBeDriver'] is bool) {
        target['role'] = updates['canBeDriver'] == true ? 'Conducteur' : 'Passager';
      }
      mergeNested('preferences');
      mergeNested('notifications');
      mergeNested('privacy');
      mergeNested('visibility');

      return <String, dynamic>{'success': true, 'data': _cloneMap(target)};
    }

    return null;
  }

  static void _updateReservationStatus(String reservationId, String status) {
    final Map<String, dynamic>? reservation = _reservationById[reservationId];
    if (reservation != null) {
      reservation['status'] = status;
    }
    for (final Map<String, dynamic> row in _passengerReservations) {
      if (row['id']?.toString() == reservationId) {
        row['status'] = status;
      }
    }
    for (final Map<String, dynamic> trip in _driverTrips) {
      final List<dynamic> requests = trip['reservationRequests'] as List<dynamic>? ?? <dynamic>[];
      for (final dynamic item in requests) {
        if (item is Map<String, dynamic> &&
            item['id']?.toString() == reservationId) {
          item['status'] = status;
        }
      }
    }
  }

  static void _touchThread({
    required String tripId,
    required String content,
  }) {
    final int i = _conversationThreads.indexWhere(
      (Map<String, dynamic> thread) => thread['tripId']?.toString() == tripId,
    );
    if (i == -1) return;
    _conversationThreads[i]['lastMessage'] = content;
    _conversationThreads[i]['updatedAt'] = DateTime.now().toUtc().toIso8601String();
  }

  static List<Map<String, dynamic>> _conversationItemsForRole({
    required bool isDriver,
  }) {
    final List<Map<String, dynamic>> items = _conversationThreads
        .map((Map<String, dynamic> thread) {
      final Map<String, dynamic> other = isDriver
          ? _cloneMap(thread['passenger'] as Map<String, dynamic>)
          : _cloneMap(thread['driver'] as Map<String, dynamic>);
      return <String, dynamic>{
        'id': thread['id'],
        'tripId': thread['tripId'],
        'otherUser': other,
        'lastMessage': thread['lastMessage'],
        'updatedAt': thread['updatedAt'],
        'unreadCount': 0,
      };
    }).toList()
      ..sort((Map<String, dynamic> a, Map<String, dynamic> b) =>
          b['updatedAt'].toString().compareTo(a['updatedAt'].toString()));
    return _cloneList(items).cast<Map<String, dynamic>>();
  }

  static List<Map<String, dynamic>> _driverReservationRequestsEnriched() {
    final List<Map<String, dynamic>> rows = <Map<String, dynamic>>[];
    for (final Map<String, dynamic> trip in _driverTrips) {
      final List<dynamic> requests =
          trip['reservationRequests'] as List<dynamic>? ?? <dynamic>[];
      for (final dynamic raw in requests) {
        if (raw is! Map<String, dynamic>) continue;
        final String status = raw['status']?.toString().toLowerCase() ?? '';
        if (!status.contains('pending') && !status.contains('attente')) {
          continue;
        }

        final Map<String, dynamic> passenger =
            raw['passenger'] is Map<String, dynamic>
                ? _cloneMap(raw['passenger'] as Map<String, dynamic>)
                : <String, dynamic>{
                    'id': _passengerUser['id'],
                    'firstName': _passengerUser['firstName'],
                    'lastName': _passengerUser['lastName'],
                    'avatarUrl': _passengerUser['avatarUrl'],
                    'averageRating': _passengerUser['averageRating'],
                    'totalTripsAsPassenger':
                        _passengerUser['stats']?['totalTrips'] ?? 0,
                  };

        final String departureTime = trip['departureTime']?.toString() ?? '';
        final DateTime? dt = DateTime.tryParse(departureTime);
        final String departureDate = dt == null
            ? DateTime.now().toUtc().toIso8601String().split('T').first
            : dt.toUtc().toIso8601String().split('T').first;
        final String departureHour = dt == null
            ? '08:00:00'
            : '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}:00';

        rows.add(<String, dynamic>{
          'reservation': <String, dynamic>{
            'id': raw['id'],
            'tripId': trip['id'],
            'status': raw['status'] ?? 'pending',
            'requestedAt': DateTime.now().toUtc().toIso8601String(),
          },
          'trip': <String, dynamic>{
            'id': trip['id'],
            'departureLabel': trip['departureLabel'],
            'arrivalLabel': trip['arrivalLabel'],
            'departureDate': departureDate,
            'departureTime': departureHour,
            'estimatedDurationMinutes':
                _toInt(trip['estimatedDurationMin'], fallback: 20),
            'maxPassengers': _toInt(trip['totalSeats'], fallback: 4),
            'currentPassengers': 1,
            'pricePerPassenger': _toDouble(trip['passengerPrice']),
            'status': trip['status'] ?? 'published',
          },
          'driver': <String, dynamic>{
            'id': _driverUser['id'],
            'firstName': _driverUser['firstName'],
            'lastName': _driverUser['lastName'],
            'avatarUrl': _driverUser['avatarUrl'],
            'averageRating': _driverUser['averageRating'],
            'totalTripsAsDriver': _driverUser['stats']?['totalTrips'] ?? 0,
          },
          'passenger': passenger,
        });
      }
    }
    return rows;
  }

  static List<Map<String, dynamic>> _passengerReservationsEnriched() {
    return _passengerReservations.map((Map<String, dynamic> row) {
      final Map<String, dynamic> trip =
          row['trip'] is Map<String, dynamic>
              ? _cloneMap(row['trip'] as Map<String, dynamic>)
              : <String, dynamic>{};
      final Map<String, dynamic> driver =
          row['driver'] is Map<String, dynamic>
              ? _cloneMap(row['driver'] as Map<String, dynamic>)
              : <String, dynamic>{};

      final String departureTime = trip['departureTime']?.toString() ?? '';
      final DateTime? dt = DateTime.tryParse(departureTime);
      final String departureDate = dt == null
          ? DateTime.now().toUtc().toIso8601String().split('T').first
          : dt.toUtc().toIso8601String().split('T').first;
      final String departureHour = dt == null
          ? '08:00:00'
          : '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}:00';

      return <String, dynamic>{
        'reservation': <String, dynamic>{
          'id': row['id'],
          'tripId': row['tripId'],
          'status': row['status'],
          'requestedAt': DateTime.now().toUtc().toIso8601String(),
        },
        'trip': <String, dynamic>{
          'id': trip['id'] ?? row['tripId'],
          'departureLabel': trip['departureLabel'],
          'arrivalLabel': trip['arrivalLabel'],
          'departureDate': departureDate,
          'departureTime': departureHour,
          'estimatedDurationMinutes':
              _toInt(trip['estimatedDurationMin'], fallback: 20),
          'maxPassengers': _toInt(trip['totalSeats'], fallback: 4),
          'currentPassengers': 1,
          'pricePerPassenger': _toDouble(row['price'] ?? trip['passengerPrice']),
          'status': trip['status'] ?? 'published',
        },
        'driver': <String, dynamic>{
          'id': driver['id'] ?? _driverUser['id'],
          'firstName': driver['firstName'] ?? _driverUser['firstName'],
          'lastName': driver['lastName'] ?? _driverUser['lastName'],
          'avatarUrl': driver['avatarUrl'] ?? _driverUser['avatarUrl'],
          'averageRating':
              _toDouble(driver['rating'] ?? driver['averageRating'], fallback: 4.7),
          'totalTripsAsDriver':
              _toInt(driver['tripCount'], fallback: _driverUser['stats']?['totalTrips'] ?? 0),
        },
        'passenger': <String, dynamic>{
          'id': _passengerUser['id'],
          'firstName': _passengerUser['firstName'],
          'lastName': _passengerUser['lastName'],
          'avatarUrl': _passengerUser['avatarUrl'],
          'averageRating': _passengerUser['averageRating'],
          'totalTripsAsPassenger': _passengerUser['stats']?['totalTrips'] ?? 0,
        },
      };
    }).toList();
  }

  static List<Map<String, dynamic>> _searchTrips({
    Map<String, dynamic>? params,
  }) {
    final String from = params?['from']?.toString().trim().toLowerCase() ?? '';
    final String to = params?['to']?.toString().trim().toLowerCase() ?? '';
    final int seats = _toInt(params?['seats'], fallback: 1);

    final List<Map<String, dynamic>> filtered = _publishedTrips.where((Map<String, dynamic> trip) {
      final String dep = trip['departureLabel']?.toString().toLowerCase() ?? '';
      final String arr = trip['arrivalLabel']?.toString().toLowerCase() ?? '';
      final int availableSeats = _toInt(trip['availableSeats'], fallback: 0);
      final bool matchFrom = from.isEmpty || dep.contains(from);
      final bool matchTo = to.isEmpty || arr.contains(to);
      final bool seatsOk = availableSeats >= seats;
      return matchFrom && matchTo && seatsOk;
    }).map((Map<String, dynamic> row) => _cloneMap(row)).toList();

    if (filtered.isNotEmpty) return filtered;
    return _cloneList(_publishedTrips).cast<Map<String, dynamic>>();
  }

  static Map<String, dynamic>? _findTripById(String id) {
    final List<Map<String, dynamic>> all = <Map<String, dynamic>>[
      ..._publishedTrips,
      ..._driverTrips,
      ..._draftTrips,
      ..._historyTrips,
    ];
    for (final Map<String, dynamic> trip in all) {
      if (trip['id']?.toString() == id) {
        return _cloneMap(trip);
      }
    }
    return null;
  }

  static Map<String, dynamic> _driverPreview(Map<String, dynamic> full) {
    return <String, dynamic>{
      'id': full['id'],
      'firstName': full['firstName'],
      'lastName': full['lastName'],
      'avatarUrl': full['avatarUrl'],
      'rating': full['averageRating'],
      'tripCount': full['stats']?['totalTrips'] ?? 0,
    };
  }

  static Map<String, dynamic> _flatStatusTrip(
    Map<String, dynamic> base,
    String status,
  ) {
    final Map<String, dynamic> row = _cloneMap(base);
    row['status'] = status;
    return row;
  }

  static Map<String, dynamic> _buildTrip({
    required String id,
    required Map<String, dynamic> driver,
    required String departureLabel,
    required String arrivalLabel,
    required DateTime departureTime,
    required int availableSeats,
    required int totalSeats,
    required double pricePerPassenger,
    required String paymentMethod,
    required int durationMin,
    required double distanceKm,
    required String status,
    required List<List<double>> polyline,
  }) {
    final String driverName =
        '${driver['firstName'] ?? ''} ${driver['lastName'] ?? ''}'.trim();
    return <String, dynamic>{
      'id': id,
      'driver': _cloneMap(driver),
      'driverName': driverName,
      'driverRating': _toDouble(driver['rating'], fallback: 4.7),
      'driverTripCount': _toInt(driver['tripCount'], fallback: 20),
      'departureLabel': departureLabel,
      'arrivalLabel': arrivalLabel,
      'departureAddress': departureLabel,
      'arrivalAddress': arrivalLabel,
      'departureDate': _dateLabel(departureTime),
      'departureTime': departureTime.toUtc().toIso8601String(),
      'departureDateTime': departureTime.toUtc().toIso8601String(),
      'availableSeats': availableSeats,
      'totalSeats': totalSeats,
      'seats': totalSeats,
      'pricePerPassenger': pricePerPassenger,
      'pricePerSeat': pricePerPassenger,
      'passengerPrice': pricePerPassenger,
      'price': pricePerPassenger,
      'vehicleModel': 'Toyota Corolla',
      'vehicleColor': 'Bleu nuit',
      'vehicle': <String, dynamic>{
        'label': 'Toyota Corolla',
        'color': 'Bleu nuit',
      },
      'paymentMethod': paymentMethod,
      'estimatedDurationMin': durationMin,
      'estimatedDuration': durationMin * 60,
      'estimatedDistanceKm': distanceKm,
      'estimatedDistance': distanceKm * 1000,
      'preferences': <String, dynamic>{
        'baggageAllowed': true,
        'petsAllowed': false,
        'smokingAllowed': false,
        'musicAllowed': true,
        'flexibleItinerary': false,
        'driverNote': 'Merci d\'etre a l\'heure au point de rencontre.',
      },
      'status': <String, dynamic>{
        'tripType': 'unique',
        'isRecurrent': false,
        'lastUpdatedAt': DateTime.now().toUtc().toIso8601String(),
      },
      'tripStatus': status,
      'routePolyline': polyline,
      'polyline': polyline,
      'waypoints': polyline
          .map((List<double> point) => <String, dynamic>{
                'lat': point[0],
                'lng': point[1],
              })
          .toList(),
    };
  }

  static void _ensureReady() {
    if (_ready) return;

    final DateTime now = DateTime.now();
    final DateTime morningTrip = DateTime(now.year, now.month, now.day + 1, 7, 40);
    final DateTime eveningTrip = DateTime(now.year, now.month, now.day + 1, 17, 10);
    final DateTime soonTrip = now.add(const Duration(hours: 3));
    final DateTime midTrip = now.add(const Duration(hours: 5));
    final DateTime draftTripDate = now.add(const Duration(days: 2, hours: 2));

    _driverUser = <String, dynamic>{
      'id': 'user_driver_001',
      'firstName': 'Nadia',
      'lastName': 'Belanger',
      'email': 'nadia.belanger@lacite.ca',
      'role': 'Conducteur',
      'schoolRole': 'Employe La Cite',
      'avatarUrl': '',
      'averageRating': 4.8,
      'isVerified': true,
      'stats': <String, dynamic>{
        'goScore': 642,
        'totalTrips': 34,
        'averageRating': 4.8,
        'co2SavedKg': 286,
      },
      'preferences': <String, dynamic>{
        'musicAccepted': true,
        'petsAccepted': false,
        'smokingAccepted': false,
        'conversationLevel': 'moderate',
      },
      'notifications': <String, dynamic>{
        'emailPrimordiales': true,
        'emailSecondaires': true,
        'emailNegligeables': false,
        'pushPrimordiales': true,
        'pushSecondaires': true,
        'pushNegligeables': false,
      },
      'privacy': <String, dynamic>{
        'showPhoneNumber': false,
        'showLastName': true,
        'allowAffinityTracking': true,
      },
      'visibility': <String, dynamic>{
        'showGoScore': true,
        'showTripsCount': true,
        'showRating': true,
        'showCo2': true,
      },
      'languagesSpoken': <String>['Francais', 'English'],
    };

    _passengerUser = <String, dynamic>{
      'id': 'user_passenger_001',
      'firstName': 'Samir',
      'lastName': 'Khan',
      'email': 'samir.khan@etudiant.lacite.ca',
      'role': 'Passager',
      'schoolRole': 'Etudiant',
      'avatarUrl': '',
      'averageRating': 4.6,
      'isVerified': true,
      'stats': <String, dynamic>{
        'goScore': 413,
        'totalTrips': 18,
        'averageRating': 4.6,
        'co2SavedKg': 141,
      },
      'preferences': <String, dynamic>{
        'musicAccepted': true,
        'petsAccepted': true,
        'smokingAccepted': false,
        'conversationLevel': 'low',
      },
      'notifications': <String, dynamic>{
        'emailPrimordiales': true,
        'emailSecondaires': true,
        'emailNegligeables': false,
        'pushPrimordiales': true,
        'pushSecondaires': false,
        'pushNegligeables': false,
      },
      'privacy': <String, dynamic>{
        'showPhoneNumber': false,
        'showLastName': false,
        'allowAffinityTracking': true,
      },
      'visibility': <String, dynamic>{
        'showGoScore': true,
        'showTripsCount': true,
        'showRating': true,
        'showCo2': true,
      },
      'languagesSpoken': <String>['Francais', 'English', 'Arabic'],
    };

    final Map<String, dynamic> driverA = _driverPreview(_driverUser);
    final Map<String, dynamic> driverB = <String, dynamic>{
      'id': 'user_driver_002',
      'firstName': 'Amelie',
      'lastName': 'Roy',
      'avatarUrl': '',
      'rating': 4.9,
      'tripCount': 58,
    };
    final Map<String, dynamic> driverC = <String, dynamic>{
      'id': 'user_driver_003',
      'firstName': 'Lucas',
      'lastName': 'Martin',
      'avatarUrl': '',
      'rating': 4.7,
      'tripCount': 46,
    };

    final Map<String, dynamic> trip201 = _buildTrip(
      id: 'trip_201',
      driver: driverA,
      departureLabel: 'Campus La Cite',
      arrivalLabel: 'Place d\'Orleans',
      departureTime: morningTrip,
      availableSeats: 2,
      totalSeats: 3,
      pricePerPassenger: 7.5,
      paymentMethod: 'cash',
      durationMin: 28,
      distanceKm: 11.8,
      status: 'published',
      polyline: <List<double>>[
        <double>[45.4215, -75.6699],
        <double>[45.4300, -75.6400],
        <double>[45.4580, -75.5800],
        <double>[45.4775, -75.5250],
      ],
    );

    final Map<String, dynamic> trip202 = _buildTrip(
      id: 'trip_202',
      driver: driverA,
      departureLabel: 'Place d\'Orleans',
      arrivalLabel: 'Campus La Cite',
      departureTime: eveningTrip,
      availableSeats: 1,
      totalSeats: 3,
      pricePerPassenger: 8.0,
      paymentMethod: 'interac',
      durationMin: 30,
      distanceKm: 12.2,
      status: 'in_progress',
      polyline: <List<double>>[
        <double>[45.4775, -75.5250],
        <double>[45.4600, -75.5600],
        <double>[45.4400, -75.6200],
        <double>[45.4215, -75.6699],
      ],
    );

    final Map<String, dynamic> trip301 = _buildTrip(
      id: 'trip_301',
      driver: driverB,
      departureLabel: 'Gatineau Centre',
      arrivalLabel: 'Campus La Cite',
      departureTime: soonTrip,
      availableSeats: 3,
      totalSeats: 4,
      pricePerPassenger: 6.5,
      paymentMethod: 'cash',
      durationMin: 24,
      distanceKm: 10.4,
      status: 'published',
      polyline: <List<double>>[
        <double>[45.4760, -75.7010],
        <double>[45.4550, -75.6950],
        <double>[45.4380, -75.6880],
        <double>[45.4215, -75.6699],
      ],
    );

    final Map<String, dynamic> trip302 = _buildTrip(
      id: 'trip_302',
      driver: driverC,
      departureLabel: 'Barrhaven Town Centre',
      arrivalLabel: 'Campus La Cite',
      departureTime: midTrip,
      availableSeats: 2,
      totalSeats: 4,
      pricePerPassenger: 9.0,
      paymentMethod: 'interac',
      durationMin: 42,
      distanceKm: 27.1,
      status: 'published',
      polyline: <List<double>>[
        <double>[45.2820, -75.7550],
        <double>[45.3350, -75.7200],
        <double>[45.3870, -75.7000],
        <double>[45.4215, -75.6699],
      ],
    );

    final Map<String, dynamic> trip401 = _buildTrip(
      id: 'trip_401',
      driver: driverA,
      departureLabel: 'Maison',
      arrivalLabel: 'Campus La Cite',
      departureTime: draftTripDate,
      availableSeats: 3,
      totalSeats: 4,
      pricePerPassenger: 5.0,
      paymentMethod: 'cash',
      durationMin: 18,
      distanceKm: 8.6,
      status: 'draft',
      polyline: <List<double>>[
        <double>[45.4050, -75.7200],
        <double>[45.4140, -75.6990],
        <double>[45.4215, -75.6699],
      ],
    );

    _publishedTrips = <Map<String, dynamic>>[
      trip201,
      trip202,
      trip301,
      trip302,
    ];

    _driverTrips = <Map<String, dynamic>>[
      _flatStatusTrip(trip201, 'published')
        ..['reservationRequests'] = <Map<String, dynamic>>[
          <String, dynamic>{
            'id': 'res_9100',
            'status': 'pending',
            'passenger': <String, dynamic>{
              'id': _passengerUser['id'],
              'firstName': _passengerUser['firstName'],
              'lastName': _passengerUser['lastName'],
              'avatarUrl': _passengerUser['avatarUrl'],
              'averageRating': _passengerUser['averageRating'],
            },
          },
        ],
      _flatStatusTrip(trip202, 'in_progress')
        ..['reservationRequests'] = <Map<String, dynamic>>[],
    ];

    _passengerTrips = <Map<String, dynamic>>[
      _flatStatusTrip(trip301, 'confirmed'),
      _flatStatusTrip(trip302, 'pending'),
    ];

    _draftTrips = <Map<String, dynamic>>[
      _flatStatusTrip(trip401, 'draft'),
    ];

    _historyTrips = <Map<String, dynamic>>[
      _flatStatusTrip(trip301, 'completed'),
      _flatStatusTrip(trip302, 'cancelled'),
    ];

    _passengerReservations = <Map<String, dynamic>>[
      <String, dynamic>{
        'id': 'res_9001',
        'tripId': 'trip_301',
        'status': 'confirmed',
        'requestedSeats': 1,
        'price': 6.5,
        'driver': _cloneMap(driverB),
        'trip': _cloneMap(trip301),
      },
      <String, dynamic>{
        'id': 'res_9002',
        'tripId': 'trip_302',
        'status': 'pending',
        'requestedSeats': 1,
        'price': 9.0,
        'driver': _cloneMap(driverC),
        'trip': _cloneMap(trip302),
      },
    ];

    _reservationById = <String, Map<String, dynamic>>{
      'res_9001': <String, dynamic>{
        ..._cloneMap(_passengerReservations[0]),
      },
      'res_9002': <String, dynamic>{
        ..._cloneMap(_passengerReservations[1]),
      },
      'res_9100': <String, dynamic>{
        'id': 'res_9100',
        'status': 'pending',
        'seats': 1,
        'price': 7.5,
        'passenger': <String, dynamic>{
          'id': _passengerUser['id'],
          'firstName': _passengerUser['firstName'],
          'lastName': _passengerUser['lastName'],
          'avatarUrl': '',
          'rating': _passengerUser['averageRating'],
          'tripCount': _passengerUser['stats']?['totalTrips'] ?? 0,
        },
        'trip': _cloneMap(trip201),
      },
    };

    _conversationThreads = <Map<String, dynamic>>[
      <String, dynamic>{
        'id': 'conv_trip_301',
        'tripId': 'trip_301',
        'driver': _cloneMap(driverB),
        'passenger': _driverPreview(_passengerUser),
        'lastMessage': 'Parfait, merci! A tantot.',
        'updatedAt': now.subtract(const Duration(minutes: 18)).toUtc().toIso8601String(),
      },
      <String, dynamic>{
        'id': 'conv_trip_201',
        'tripId': 'trip_201',
        'driver': _cloneMap(driverA),
        'passenger': _driverPreview(_passengerUser),
        'lastMessage': 'Je serai au point de depart 5 min avant.',
        'updatedAt': now.subtract(const Duration(hours: 2)).toUtc().toIso8601String(),
      },
    ];

    _messagesByTrip = <String, List<Map<String, dynamic>>>{
      'trip_301': <Map<String, dynamic>>[
        <String, dynamic>{
          'id': 'msg_3001',
          'tripId': 'trip_301',
          'senderId': _passengerUser['id'],
          'content': 'Bonjour, le point de rendez-vous est bien devant l\'entree principale?',
          'sentAt': now.subtract(const Duration(minutes: 35)).toUtc().toIso8601String(),
          'isRead': true,
        },
        <String, dynamic>{
          'id': 'msg_3002',
          'tripId': 'trip_301',
          'senderId': driverB['id'],
          'content': 'Oui, devant l\'entree principale cote nord.',
          'sentAt': now.subtract(const Duration(minutes: 26)).toUtc().toIso8601String(),
          'isRead': true,
        },
        <String, dynamic>{
          'id': 'msg_3003',
          'tripId': 'trip_301',
          'senderId': _passengerUser['id'],
          'content': 'Parfait, merci! A tantot.',
          'sentAt': now.subtract(const Duration(minutes: 18)).toUtc().toIso8601String(),
          'isRead': false,
        },
      ],
      'trip_201': <Map<String, dynamic>>[
        <String, dynamic>{
          'id': 'msg_2010',
          'tripId': 'trip_201',
          'senderId': _passengerUser['id'],
          'content': 'Salut Nadia, j\'aimerais reserver une place.',
          'sentAt': now.subtract(const Duration(hours: 2, minutes: 10)).toUtc().toIso8601String(),
          'isRead': true,
        },
      ],
    };

    _notifications = <Map<String, dynamic>>[
      <String, dynamic>{
        'id': 'notif_1001',
        'type': 'Reservation',
        'title': 'Nouvelle demande de reservation',
        'body': '${_passengerUser['firstName']} souhaite rejoindre votre trajet de demain matin.',
        'createdAt': now.subtract(const Duration(minutes: 22)).toUtc().toIso8601String(),
        'isRead': false,
        'tripId': 'trip_201',
        'data': <String, dynamic>{'tripId': 'trip_201'},
        'trip': _cloneMap(trip201),
        'passengerName': '${_passengerUser['firstName']} ${_passengerUser['lastName']}',
        'driverName': '${_driverUser['firstName']} ${_driverUser['lastName']}',
      },
      <String, dynamic>{
        'id': 'notif_1002',
        'type': 'Trip',
        'title': 'Trajet confirme',
        'body': 'Votre reservation pour Gatineau Centre -> Campus La Cite est confirmee.',
        'createdAt': now.subtract(const Duration(hours: 5)).toUtc().toIso8601String(),
        'isRead': true,
        'tripId': 'trip_301',
        'data': <String, dynamic>{'tripId': 'trip_301'},
        'trip': _cloneMap(trip301),
      },
      <String, dynamic>{
        'id': 'notif_1003',
        'type': 'Review',
        'title': 'Nouvel avis recu',
        'body': 'Amelie vous a attribue 5 etoiles.',
        'createdAt': now.subtract(const Duration(days: 1)).toUtc().toIso8601String(),
        'isRead': true,
        'tripId': 'trip_301',
        'data': <String, dynamic>{'tripId': 'trip_301'},
        'trip': _cloneMap(trip301),
        'review': <String, dynamic>{
          'rating': 5,
          'comment': 'Passager ponctuel et tres courtois.',
          'reviewerName': 'Amelie Roy',
        },
      },
    ];

    _favorites = <String, dynamic>{
      'drivers': <Map<String, dynamic>>[
        <String, dynamic>{
          'id': 'fav_driver_1',
          'firstName': 'Amelie',
          'lastName': 'Roy',
          'initials': 'AR',
          'rating': 4.9,
          'bg': 0xFFE8F0FE,
          'fg': 0xFF1A56CC,
        },
        <String, dynamic>{
          'id': 'fav_driver_2',
          'firstName': 'Lucas',
          'lastName': 'Martin',
          'initials': 'LM',
          'rating': 4.7,
          'bg': 0xFFE1F5EE,
          'fg': 0xFF0F6E56,
        },
      ],
      'places': <Map<String, dynamic>>[
        <String, dynamic>{
          'id': 'fav_place_1',
          'label': 'Campus',
          'address': '801 promenade de l\'Aviation, Ottawa',
          'icon': 'school',
          'freq': '22 min',
          'iconBg': 0xFFE8F0FE,
          'iconColor': 0xFF1A56CC,
        },
        <String, dynamic>{
          'id': 'fav_place_2',
          'label': 'Maison',
          'address': '142 rue des Erables, Gatineau',
          'icon': 'home',
          'freq': '15 min',
          'iconBg': 0xFFE1F5EE,
          'iconColor': 0xFF0F6E56,
        },
      ],
      'alerts': <Map<String, dynamic>>[
        <String, dynamic>{
          'id': 'alert_1',
          'departure': 'Maison',
          'arrival': 'Campus La Cite',
          'timeRange': 'Lun - Ven - 07h30',
          'isActive': true,
        },
      ],
    };

    _reviews = <String, dynamic>{
      'received': <Map<String, dynamic>>[
        <String, dynamic>{
          'id': 'review_1',
          'author': <String, dynamic>{
            'firstName': 'Amelie',
            'lastName': 'Roy',
          },
          'rating': 5,
          'comment': 'Passager ponctuel, communication claire.',
          'createdAt': _dateLabel(now.subtract(const Duration(days: 2))),
          'tripRoute': 'Gatineau Centre -> Campus La Cite',
        },
        <String, dynamic>{
          'id': 'review_2',
          'author': <String, dynamic>{
            'firstName': 'Lucas',
            'lastName': 'Martin',
          },
          'rating': 4.5,
          'comment': 'Tres agreable durant le trajet.',
          'createdAt': _dateLabel(now.subtract(const Duration(days: 5))),
          'tripRoute': 'Barrhaven Town Centre -> Campus La Cite',
        },
      ],
      'given': <Map<String, dynamic>>[
        <String, dynamic>{
          'id': 'review_3',
          'author': <String, dynamic>{
            'firstName': 'Samir',
            'lastName': 'Khan',
          },
          'rating': 5,
          'comment': 'Conductrice super ponctuelle et trajet fluide.',
          'createdAt': _dateLabel(now.subtract(const Duration(days: 1))),
          'tripRoute': 'Campus La Cite -> Place d\'Orleans',
          'direction': 'given',
        },
      ],
    };

    _stats = <String, dynamic>{
      'goScore': 642,
      'stats': <String, dynamic>{
        'goScore': 642,
        'tripsCount': 34,
        'paidTrips': 28,
        'co2SavedKg': 286,
        'averageRating': 4.8,
        'reviewsCount': 19,
        'monthlyRevenue': 372,
      },
    };

    _finances = <String, dynamic>{
      'goScore': 642,
      'availableBalance': 412.5,
      'inTransit': 48.0,
      'penalties': 0,
      'grossRevenue': 1296.0,
      'netRevenue': 1150.0,
      'monthlyRevenue': 372.0,
      'monthlyGoal': 500.0,
      'weeklyRevenue': 96.0,
      'commission': 14.0,
    };

    _goboard = <Map<String, dynamic>>[
      <String, dynamic>{
        'id': 'gt_1',
        'title': 'Completer 3 trajets cette semaine',
        'description': 'Continuez votre rythme pour gagner plus de points.',
        'points': 20,
        'done': true,
      },
      <String, dynamic>{
        'id': 'gt_2',
        'title': 'Accepter une nouvelle demande',
        'description': 'Aidez un nouvel utilisateur a rejoindre le campus.',
        'points': 15,
        'done': false,
      },
      <String, dynamic>{
        'id': 'gt_3',
        'title': 'Publier un trajet du soir',
        'description': 'Ajoutez un trajet retour pour demain soir.',
        'points': 12,
        'done': false,
      },
    ];

    _vehicles = <Map<String, dynamic>>[
      <String, dynamic>{
        'id': 'veh_001',
        'label': 'Toyota Corolla',
        'color': 'Bleu nuit',
        'maxPassengers': 3,
      },
      <String, dynamic>{
        'id': 'veh_002',
        'label': 'Hyundai Elantra',
        'color': 'Gris perle',
        'maxPassengers': 4,
      },
    ];

    _driverDashboard = <String, dynamic>{
      'firstName': _driverUser['firstName'],
      'stats': <String, dynamic>{
        'totalTrips': 34,
        'avgRating': 4.8,
        'totalPassengers': 86,
        'totalRevenue': 1296,
      },
      'pendingRequests': <Map<String, dynamic>>[
        <String, dynamic>{
          'id': 'res_9100',
          'passengerFirstName': _passengerUser['firstName'],
          'passengerLastName': _passengerUser['lastName'],
          'trip': _cloneMap(_findTripById('trip_201')!),
        },
      ],
    };

    _passengerDashboard = <String, dynamic>{
      'firstName': _passengerUser['firstName'],
      'stats': <String, dynamic>{
        'totalTrips': 18,
        'avgRating': 4.6,
        'totalPassengers': 0,
        'totalRevenue': 0,
      },
      'pendingRequests': <Map<String, dynamic>>[],
    };

    _ready = true;
  }

  static String _dateLabel(DateTime dt) {
    final String mm = dt.month.toString().padLeft(2, '0');
    final String dd = dt.day.toString().padLeft(2, '0');
    return '${dt.year}-$mm-$dd';
  }

  static int _toInt(dynamic value, {int fallback = 0}) {
    if (value is int) return value;
    if (value is num) return value.toInt();
    return int.tryParse(value?.toString() ?? '') ?? fallback;
  }

  static double _toDouble(dynamic value, {double fallback = 0}) {
    if (value is double) return value;
    if (value is num) return value.toDouble();
    return double.tryParse(value?.toString() ?? '') ?? fallback;
  }

  static List<dynamic> _cloneList(List<dynamic> input) {
    return jsonDecode(jsonEncode(input)) as List<dynamic>;
  }

  static Map<String, dynamic> _cloneMap(Map<String, dynamic> input) {
    return (jsonDecode(jsonEncode(input)) as Map<dynamic, dynamic>)
        .cast<String, dynamic>();
  }
}
