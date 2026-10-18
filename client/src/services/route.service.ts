import api from './api';
import type { RouteDetailView } from '../types';

export interface RouteListItem {
  id: string;
  departureStationId: string;
  departureStationName: string;
  departureProvinceId: string;
  departureProvince: string;
  arrivalStationId: string;
  arrivalStationName: string;
  arrivalProvinceId: string;
  arrivalProvince: string;
  distanceKm: number;
  estimatedDuration: number;
}

export interface CreateRoutePayload {
  routeId?: string;
  departureStationId: string;
  arrivalStationId: string;
  distanceKm: number;
  estimatedDuration: number;
  intermediateStations?: {
    stationId: string;
    stopOrder: number;
  }[];
}

export interface UpdateRoutePayload {
  departureStationId: string;
  arrivalStationId: string;
  distanceKm: number;
  estimatedDuration: number;
  intermediateStations?: {
    stationId: string;
    stopOrder: number;
  }[];
}

export const routeService = {
  // Public
  getAllRoutes: (): Promise<RouteListItem[]> => {
    return api.get<RouteListItem[]>('/routes');
  },

  getRouteById: (routeId: string): Promise<RouteDetailView> => {
    return api.get<RouteDetailView>(`/routes/${routeId}`);
  },

  // Admin
  createRoute: (payload: CreateRoutePayload): Promise<RouteDetailView> => {
    return api.post<RouteDetailView>('/admin/routes', payload);
  },

  updateRoute: (routeId: string, payload: UpdateRoutePayload): Promise<RouteDetailView> => {
    return api.put<RouteDetailView>(`/admin/routes/${routeId}`, payload);
  },

  deleteRoute: (routeId: string): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/admin/routes/${routeId}`);
  },
};

export default routeService;
