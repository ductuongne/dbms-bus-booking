import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Ticket,
  Bus,
  TrendingUp,
  MapPin,
  Clock,
  ArrowUpRight,
  BarChart3,
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { mockBookings, mockTrips, mockTickets, mockRoutes, mockStations } from '../mocks/mockData';
import { formatCurrency } from '../utils';
import { routeService, type RouteListItem } from '../services/route.service';

export const ReportsPage: React.FC = () => {
  const [routes, setRoutes] = useState<RouteListItem[]>([]);

  useEffect(() => {
    let ignore = false;
    routeService
      .getAllRoutes()
      .then((data) => {
        if (!ignore && data && data.length > 0) {
          setRoutes(data);
        }
      })
      .catch(() => {
        // Fallback silently to mock data
      });
    return () => {
      ignore = true;
    };
  }, []);

  // Tính toán số liệu thống kê từ mock data
  const totalRevenue = mockBookings
    .filter((b) => b.status !== 'CANCELLED')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const totalTickets = mockTickets.length;
  const tripsTodayCount = mockTrips.length;
  const occupancyRate = 86.5; // Tỷ lệ lấp đầy giả lập %

  // Dữ liệu biểu đồ doanh thu 7 ngày qua (SVG thuần theo B0.3, B6.2)
  const chartData = [
    { day: 'Th 2', revenue: 2450000 },
    { day: 'Th 3', revenue: 3100000 },
    { day: 'Th 4', revenue: 2800000 },
    { day: 'Th 5', revenue: 4200000 },
    { day: 'Th 6', revenue: 5600000 },
    { day: 'Th 7', revenue: 6800000 },
    { day: 'CN', revenue: 6100000 },
  ];

  const maxRevenue = Math.max(...chartData.map((d) => d.revenue));

  // Top 5 tuyến đông khách nhất
  const topRoutes = routes.length > 0
    ? routes.slice(0, 4).map((route, idx) => {
        const ticketsSold = [142, 98, 76, 54][idx] || 40;
        const estRevenue = [25560000, 17640000, 11400000, 9450000][idx] || 5000000;
        return {
          id: route.id,
          name: `${route.departureStationName} → ${route.arrivalStationName}`,
          distance: `${route.distanceKm} km`,
          duration: `${Math.floor(route.estimatedDuration / 60)}g ${route.estimatedDuration % 60}ph`,
          ticketsSold,
          revenue: estRevenue,
        };
      })
    : mockRoutes.slice(0, 4).map((route, idx) => {
        const depStation = mockStations.find((s) => s.id === route.departureStationId);
        const arrStation = mockStations.find((s) => s.id === route.arrivalStationId);
        const ticketsSold = [142, 98, 76, 54][idx] || 40;
        const estRevenue = [25560000, 17640000, 11400000, 9450000][idx] || 5000000;

        return {
          id: route.id,
          name: `${depStation?.name || 'Hà Nội'} → ${arrStation?.name || 'Ninh Bình'}`,
          distance: `${route.distanceKm} km`,
          duration: `${Math.floor(route.estimatedDuration / 60)}g ${route.estimatedDuration % 60}ph`,
          ticketsSold,
          revenue: estRevenue,
        };
      });

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#1E3A5F]" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Báo cáo & Thống kê
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
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
              {topRoutes.map((route, idx) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ReportsPage;
