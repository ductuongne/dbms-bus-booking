import api from './api';
import type { BusListItemView, BusDetailView, BusType, Seat } from '../types';

export interface CreateBusPayload {
  busId?: string;
  licensePlate: string;
  typeId: string;
  status: 'ACTIVE' | 'INACTIVE';
  customSeats?: {
    seatNumber: string;
    floor: number;
    seatType: 'NORMAL' | 'VIP' | 'SLEEPER';
  }[];
}

export interface UpdateBusPayload {
  licensePlate: string;
  typeId: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface CreateBusTypePayload {
  typeId?: string;
  name: string;
  totalSeats: number;
  floors: number;
}

export interface UpdateBusTypePayload {
  name: string;
  totalSeats: number;
  floors: number;
}

export const busService = {
  // Public
  getBusById: (busId: string): Promise<BusDetailView> => {
    return api.get<BusDetailView>(`/buses/${busId}`);
  },

  getBusSeats: (busId: string): Promise<Seat[]> => {
    return api.get<Seat[]>(`/buses/${busId}/seats`);
  },

  // Admin
  getAllBuses: (): Promise<BusListItemView[]> => {
    return api.get<BusListItemView[]>('/admin/buses');
  },

  createBus: (payload: CreateBusPayload): Promise<BusDetailView> => {
    return api.post<BusDetailView>('/admin/buses', payload);
  },

  updateBus: (busId: string, payload: UpdateBusPayload): Promise<BusListItemView> => {
    return api.put<BusListItemView>(`/admin/buses/${busId}`, payload);
  },

  changeBusStatus: (busId: string, status: 'ACTIVE' | 'INACTIVE'): Promise<{ message: string }> => {
    return api.patch<{ message: string }>(`/admin/buses/${busId}/status`, { status });
  },

  deleteBus: (busId: string): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/admin/buses/${busId}`);
  },

  // Bus Types
  getAllBusTypes: (): Promise<BusType[]> => {
    return api.get<BusType[]>('/admin/bus-types');
  },

  createBusType: (payload: CreateBusTypePayload): Promise<BusType> => {
    return api.post<BusType>('/admin/bus-types', payload);
  },

  updateBusType: (typeId: string, payload: UpdateBusTypePayload): Promise<BusType> => {
    return api.put<BusType>(`/admin/bus-types/${typeId}`, payload);
  },

  deleteBusType: (typeId: string): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/admin/bus-types/${typeId}`);
  },
};

export default busService;
