import api from './api';

export interface TripSearchResultItem {
  trip_id: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  bus_type: string;
  availableSeats: number;
  route: {
    route_id: string;
    departure_station: string;
    arrival_station: string;
    departure_province: string;
    arrival_province: string;
  };
}

export interface SearchTripsResponse {
  data: TripSearchResultItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SearchTripsParams {
  fromProvinceId: string;
  toProvinceId: string;
  date: string;
  page?: number;
  limit?: number;
}

export interface TripSeatItem {
  seat_id: string;
  seat_number: string;
  status: string; // 'AVAILABLE' | 'CONFIRMED' | 'PENDING'
  price: number;
}

export interface TripSeatsResponse {
  trip: {
    trip_id: string;
    route_id: string;
    bus_id: string;
    departure_time: string;
    arrival_time: string;
    price: number;
    status: string;
  };
  seats: TripSeatItem[];
}

export interface AdminTripItem {
  trip_id: string;
  route_id: string;
  bus_id: string;
  driver_id: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  status: 'SCHEDULED' | 'DEPARTED' | 'COMPLETED' | 'CANCELLED';
  total_seats: number;
  booked_seats: number;
  pending_seats: number;
}

export interface AdminTripsResponse {
  data: AdminTripItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateTripPayload {
  route_id: string;
  bus_id: string;
  driver_id: string;
  departure_time: string;
  arrival_time: string;
  price: number;
}

export const tripService = {
  searchTrips: (params: SearchTripsParams): Promise<SearchTripsResponse> => {
    return api.get<SearchTripsResponse>('/trips/search', {
      fromProvinceId: params.fromProvinceId,
      toProvinceId: params.toProvinceId,
      date: params.date,
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    });
  },

  getTripSeats: (tripId: string): Promise<TripSeatsResponse> => {
    return api.get<TripSeatsResponse>(`/trips/${tripId}/seats`);
  },

  getTripById: (tripId: string) => {
    return api.get(`/trips/${tripId}`);
  },

  getAdminTrips: (params?: {
    page?: number;
    limit?: number;
    routeId?: string;
    status?: string;
    date?: string;
  }): Promise<AdminTripsResponse> => {
    return api.get<AdminTripsResponse>('/trips', {
      page: params?.page ?? 1,
      limit: params?.limit ?? 50,
      routeId: params?.routeId,
      status: params?.status,
      date: params?.date,
    });
  },

  createTrip: (payload: CreateTripPayload): Promise<AdminTripItem> => {
    return api.post<AdminTripItem>('/trips', payload);
  },

  changeTripStatus: (
    tripId: string,
    status: 'DEPARTED' | 'COMPLETED'
  ): Promise<Record<string, unknown>> => {
    return api.patch(`/trips/${tripId}/status`, { status });
  },

  cancelTrip: (tripId: string): Promise<{ message: string }> => {
    return api.post<{ message: string }>(`/trips/${tripId}/cancel`);
  },
};

export default tripService;

