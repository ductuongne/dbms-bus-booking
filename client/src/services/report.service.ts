import api from './api';

export interface RevenueReportItem {
  period: string;
  payment_count: number;
  total_revenue: number;
}

export interface RevenueReportResponse {
  from: string;
  to: string;
  group_by: 'DAY' | 'MONTH';
  total_revenue: number;
  total_payments: number;
  items: RevenueReportItem[];
}

export interface RouteRevenueReportItem {
  route_id: string;
  departure_station: string;
  arrival_station: string;
  tickets_sold: number;
  revenue: number;
}

export interface OccupancyReportItem {
  trip_id: string;
  route_id: string;
  departure_time: string;
  trip_status: string;
  license_plate: string;
  total_seats: number;
  sold_seats: number;
  occupancy_percent: number;
}

export const reportService = {
  getRevenueReport: (
    from: string,
    to: string,
    groupBy: 'DAY' | 'MONTH' = 'DAY'
  ): Promise<RevenueReportResponse> => {
    return api.get<RevenueReportResponse>('/admin/reports/revenue', {
      from,
      to,
      group_by: groupBy,
    });
  },

  getRouteRevenueReport: (from: string, to: string): Promise<RouteRevenueReportItem[]> => {
    return api.get<RouteRevenueReportItem[]>('/admin/reports/routes', { from, to });
  },

  getOccupancyReport: (from: string, to: string): Promise<OccupancyReportItem[]> => {
    return api.get<OccupancyReportItem[]>('/admin/reports/occupancy', { from, to });
  },
};

export default reportService;
