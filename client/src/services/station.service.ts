import api from './api';
import type { StationDetailView, Province } from '../types';

export interface CreateStationPayload {
  stationId?: string;
  name: string;
  provinceId: string;
  address: string;
}

export interface UpdateStationPayload {
  name: string;
  provinceId: string;
  address: string;
}

export const stationService = {
  // Public
  getAllStations: (provinceId?: string): Promise<StationDetailView[]> => {
    return api.get<StationDetailView[]>('/stations', { provinceId });
  },

  getStationById: (stationId: string): Promise<StationDetailView> => {
    return api.get<StationDetailView>(`/stations/${stationId}`);
  },

  getAllProvinces: (): Promise<Province[]> => {
    return api.get<Province[]>('/provinces');
  },

  // Admin
  createStation: (payload: CreateStationPayload): Promise<StationDetailView> => {
    return api.post<StationDetailView>('/admin/stations', payload);
  },

  updateStation: (stationId: string, payload: UpdateStationPayload): Promise<StationDetailView> => {
    return api.put<StationDetailView>(`/admin/stations/${stationId}`, payload);
  },

  deleteStation: (stationId: string): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/admin/stations/${stationId}`);
  },
};

export default stationService;
