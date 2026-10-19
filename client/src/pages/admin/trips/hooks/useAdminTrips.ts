import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  tripService,
  type AdminTripItem,
  type CreateTripPayload,
} from '../../../../services/trip.service';
import { routeService, type RouteListItem } from '../../../../services/route.service';
import { busService } from '../../../../services/bus.service';
import type { BusListItemView } from '../../../../types';

export function useAdminTrips() {
  const [trips, setTrips] = useState<AdminTripItem[]>([]);
  const [routes, setRoutes] = useState<RouteListItem[]>([]);
  const [buses, setBuses] = useState<BusListItemView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      setLoading(true);
      try {
        const [tripsRes, routesData, busesData] = await Promise.all([
          tripService.getAdminTrips({
            limit: 100,
            status: statusFilter !== 'ALL' ? statusFilter : undefined,
            date: dateFilter || undefined,
          }),
          routeService.getAllRoutes(),
          busService.getAllBuses(),
        ]);

        if (!ignore) {
          setTrips(tripsRes.data || []);
          setRoutes(routesData);
          setBuses(busesData);
          setError(null);
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Không thể tải danh sách chuyến xe');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void fetchData();

    return () => {
      ignore = true;
    };
  }, [statusFilter, dateFilter, reloadKey]);

  const refresh = useCallback(() => {
    setReloadKey((prev) => prev + 1);
  }, []);

  const routeMap = useMemo(() => {
    const map = new Map<string, RouteListItem>();
    routes.forEach((r) => map.set(r.id, r));
    return map;
  }, [routes]);

  const busMap = useMemo(() => {
    const map = new Map<string, BusListItemView>();
    buses.forEach((b) => map.set(b.id, b));
    return map;
  }, [buses]);

  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      const route = routeMap.get(t.route_id);
      const bus = busMap.get(t.bus_id);
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      const matchId = t.trip_id.toLowerCase().includes(q);
      const matchRoute = route
        ? `${route.departureStationName} ${route.arrivalStationName}`.toLowerCase().includes(q)
        : false;
      const matchBus = bus ? bus.licensePlate.toLowerCase().includes(q) : false;
      return matchId || matchRoute || matchBus;
    });
  }, [trips, searchQuery, routeMap, busMap]);

  const createTrip = useCallback(async (payload: CreateTripPayload) => {
    await tripService.createTrip(payload);
    refresh();
  }, [refresh]);

  const changeStatus = useCallback(async (tripId: string, newStatus: 'DEPARTED' | 'COMPLETED') => {
    await tripService.changeTripStatus(tripId, newStatus);
    refresh();
  }, [refresh]);

  const cancelTrip = useCallback(async (tripId: string) => {
    await tripService.cancelTrip(tripId);
    refresh();
  }, [refresh]);

  return {
    trips,
    routes,
    buses,
    filteredTrips,
    loading,
    error,
    routeMap,
    busMap,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    refresh,
    createTrip,
    changeStatus,
    cancelTrip,
  };
}

export default useAdminTrips;
