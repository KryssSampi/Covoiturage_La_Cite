# Dashboard Driver Route Fixes (/api/dashboard/driver/[id])

- [ ] Import UserService + add getMe to Promise.all + destructure meRes
- [ ] Add pendingCountByTrip Map/loop after rawReservations
- [ ] Add passengersByTrip Map/loop
- [ ] Update publishedTrips map (pendingRequests, passengers)
- [ ] Extract driverProfile from meRes
- [ ] Update reservationRequests map (note, doneTrips from r.passenger)
- [ ] Update stats.co2SavedKg
- [ ] Verify: cd Site_Web/covoiturage_la_cite_site_web && npm run build + test API
