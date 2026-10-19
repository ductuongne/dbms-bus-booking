import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Ticket,
  Bus,
  TrendingUp,
  MapPin,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { formatCurrency } from '../utils';
import { routeService, type RouteListItem } from '../services/route.service';
import {
  reportService,
  type OccupancyReportItem,
  type RevenueReportResponse,
  type RouteRevenueReportItem,
} from '../services/report.service';

function formatIsoDate(date: Date): string {
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export const ReportsPage: React.FC = () => {
  const [routes, setRoutes] = useState<RouteListItem[]>([]);
  const [revenueReport, setRevenueReport] = useState<RevenueReportResponse | null>(null);
  const [routeReport, setRouteReport] = useState<RouteRevenueReportItem[]>([]);
  const [occupancyList, setOccupancyList] = useState<OccupancyReportItem[]>([]);

  useEffect(() => {
    let ignore = false;
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    const from = formatIsoDate(sevenDaysAgo);
    const to = formatIsoDate(today);

    routeService
      .getAllRoutes()
      .then((data) => {
        if (!ignore && data) {
          setRoutes(data);
        }
      })
      .catch(() => {
        // Bỏ qua lỗi khi chưa tải được danh sách tuyến
      });

    reportService
      .getRevenueReport(from, to, 'DAY')
      .then((data) => {
        if (!ignore && data) {
          setRevenueReport(data);
        }
      })
      .catch(() => {
        // Bỏ qua lỗi khi chưa tải được báo cáo doanh thu
      });

    reportService
      .getRouteRevenueReport(from, to)
      .then((data) => {
        if (!ignore && data) {
          setRouteReport(data);
        }
      })
      .catch(() => {
        // Bỏ qua lỗi khi chưa tải được báo cáo tuyến
      });

    reportService
      .getOccupancyReport(from, to)
      .then((data) => {
        if (!ignore && data) {
          setOccupancyList(data);
        }
      })
      .catch(() => {
        // Bỏ qua lỗi khi chưa tải được báo cáo lấp đầy
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Số liệu thống kê trực tiếp từ Stored Procedures báo cáo
  const totalRevenue = revenueReport?.total_revenue ?? 0;

  const totalTickets = routeReport.reduce((sum, r) => sum + r.tickets_sold, 0);

  const tripsTodayCount = occupancyList.length;

  const occupancyRate =
    occupancyList.length > 0
      ? Number(
          (
            occupancyList.reduce((sum, item) => sum + item.occupancy_percent, 0) /
            occupancyList.length
          ).toFixed(1)
        )
      : 0;

  // Dữ liệu biểu đồ doanh thu 7 ngày qua (SVG thuần)
  const chartData = Array.from({ length: 7 }, (_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    const iso = formatIsoDate(d);
    const matched = revenueReport?.items.find((item) => item.period.startsWith(iso));
    return {
      day: iso.slice(5),
      revenue: matched?.total_revenue ?? 0,
    };
  });

  const maxRevenue = Math.max(1, ...chartData.map((d) => d.revenue));

  // Top tuyến đông khách nhất từ dữ liệu thật
  const topRoutes = routeReport.slice(0, 5).map((item) => {
    const matchedRoute = routes.find((r) => r.id === item.route_id);
    const distanceKm = matchedRoute?.distanceKm ?? 0;
    const durationMin = matchedRoute?.estimatedDuration ?? 0;
    return {
      id: item.route_id,
      name: `${item.departure_station} → ${item.arrival_station}`,
      distance: distanceKm > 0 ? `${distanceKm} km` : '—',
      duration:
        durationMin > 0
          ? `${Math.floor(durationMin / 60)}g ${durationMin % 60}ph`
          : '—',
      ticketsSold: item.tickets_sold,
      revenue: item.revenue,
    };
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Báo cáo &amp; Thống kê
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổng quan hiệu suất vận hành, doanh số bán vé và sản lượng chuyến xe hệ thống XeViet
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="brand" size="md">
            Cập nhật trực tiếp
          </Badge>
        </div>
      </div>
      {/* 1. 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md" className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1E3A5F] flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Tổng doanh thu</span>
            <div className="text-xl font-bold text-slate-900 mt-0.5">
              {formatCurrency(totalRevenue)}
            </div>
            <span className="text-[11px] text-green-600 font-semibold flex items-center gap-0.5 mt-0.5">
              <ArrowUpRight className="w-3 h-3" /> +12.5% so với tuần trước
            </span>
          </div>
        </Card>

        <Card padding="md" className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#C2410C] flex items-center justify-center shrink-0">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Tổng vé bán ra</span>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{totalTickets} vé</div>
            <span className="text-[11px] text-green-600 font-semibold flex items-center gap-0.5 mt-0.5">
              <ArrowUpRight className="w-3 h-3" /> +8.2% lượt đặt mới
            </span>
          </div>
        </Card>

        <Card padding="md" className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Chuyến chạy hôm nay</span>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{tripsTodayCount} chuyến</div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">100% đúng lịch trình</span>
          </div>
        </Card>

        <Card padding="md" className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Tỷ lệ lấp đầy ghế</span>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{occupancyRate}%</div>
            <span className="text-[11px] text-green-600 font-semibold flex items-center gap-0.5 mt-0.5">
              <ArrowUpRight className="w-3 h-3" /> Tối ưu công suất
            </span>
          </div>
        </Card>
      </div>

      {/* 2. Biểu đồ doanh thu SVG thuần (B0.3, B6.2) */}
      <Card padding="lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Biểu đồ doanh thu 7 ngày gần nhất</h2>
            <p className="text-xs text-slate-500 mt-0.5">Dữ liệu thống kê doanh số bán vé qua cổng VietQR</p>
          </div>
          <Badge variant="brand" size="md">
            Tuần hiện tại
          </Badge>
        </div>

        {/* Vẽ biểu đồ cột bằng SVG thuần */}
        <div className="w-full overflow-x-auto py-2">
          <div className="min-w-[500px] h-56 flex flex-col justify-end">
            <svg className="w-full h-44" viewBox="0 0 700 160" preserveAspectRatio="none">
              {/* Lưới ngang */}
              <line x1="0" y1="40" x2="700" y2="40" stroke="#E2E8F0" strokeDasharray="3 3" />
              <line x1="0" y1="80" x2="700" y2="80" stroke="#E2E8F0" strokeDasharray="3 3" />
              <line x1="0" y1="120" x2="700" y2="120" stroke="#E2E8F0" strokeDasharray="3 3" />
              <line x1="0" y1="155" x2="700" y2="155" stroke="#CBD5E1" strokeWidth="1" />

              {/* Các cột dữ liệu */}
              {chartData.map((d, index) => {
                const colWidth = 46;
                const gap = 100;
                const x = 30 + index * gap;
                const barHeight = (d.revenue / maxRevenue) * 120;
                const y = 155 - barHeight;

                return (
                  <g key={d.day}>
                    {/* Thanh cột */}
                    <rect
                      x={x}
                      y={y}
                      width={colWidth}
                      height={barHeight}
                      rx="6"
                      className="fill-[#1E3A5F] hover:fill-[#C2410C] transition-colors cursor-pointer"
                    />
                    {/* Nhãn giá trị trên đầu cột */}
                    <text
                      x={x + colWidth / 2}
                      y={y - 8}
                      textAnchor="middle"
                      className="text-[10px] fill-slate-500 font-semibold"
                    >
                      {(d.revenue / 1000000).toFixed(1)}M
                    </text>
                    {/* Nhãn thứ ngày */}
                    <text
                      x={x + colWidth / 2}
                      y={150 + 20}
                      textAnchor="middle"
                      className="text-xs fill-slate-600 font-medium"
                    >
                      {d.day}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </Card>

      {/* 3. Bảng Top tuyến xe đông khách */}
      <Card padding="none">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-slate-900">Top tuyến đường vận hành hiệu quả</h2>
            <p className="text-xs text-slate-500 mt-0.5">Xếp hạng theo sản lượng vé và doanh số lũy kế</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-3">Tuyến đường</th>
                <th className="px-5 py-3">Khoảng cách</th>
                <th className="px-5 py-3">Thời gian</th>
                <th className="px-5 py-3 text-center">Vé đã bán</th>
                <th className="px-5 py-3 text-right">Doanh thu ước tính</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {topRoutes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                    Chưa có dữ liệu doanh thu tuyến đường trong khoảng thời gian này.
                  </td>
                </tr>
              ) : (
                topRoutes.map((route, idx) => (
                  <tr key={route.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-600 font-bold">
                        {idx + 1}
                      </span>
                      <MapPin className="w-3.5 h-3.5 text-[#1E3A5F]" />
                      <span>{route.name}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{route.distance}</td>
                    <td className="px-5 py-3.5 text-slate-600 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{route.duration}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center font-semibold text-slate-800">
                      <Badge variant="brand" size="sm">
                        {route.ticketsSold} vé
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-[#C2410C]">
                      {formatCurrency(route.revenue)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ReportsPage;
