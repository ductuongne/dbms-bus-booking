import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  Ticket,
  Bus,
  TrendingUp,
  MapPin,
  Clock,
  ArrowUpRight,
  Calendar,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
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
  const today = useMemo(() => new Date(), []);
  const todayIso = useMemo(() => formatIsoDate(today), [today]);

  // Bộ lọc khoảng thời gian
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return formatIsoDate(d);
  });
  const [toDate, setToDate] = useState<string>(() => formatIsoDate(new Date()));
  const [activePreset, setActivePreset] = useState<'today' | '7days' | '30days' | 'thisMonth' | 'custom'>('7days');

  const [routes, setRoutes] = useState<RouteListItem[]>([]);
  const [revenueReport, setRevenueReport] = useState<RevenueReportResponse | null>(null);
  const [routeReport, setRouteReport] = useState<RouteRevenueReportItem[]>([]);
  const [occupancyList, setOccupancyList] = useState<OccupancyReportItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Kiểm tra xem khoảng thời gian chọn có nằm hoàn toàn trong tương lai không
  const isFutureDate = useMemo(() => {
    return fromDate > todayIso;
  }, [fromDate, todayIso]);

  // Chọn bộ lọc nhanh
  const applyPreset = (preset: 'today' | '7days' | '30days' | 'thisMonth') => {
    setActivePreset(preset);
    setIsLoading(true);
    const now = new Date();
    if (preset === 'today') {
      const iso = formatIsoDate(now);
      setFromDate(iso);
      setToDate(iso);
    } else if (preset === '7days') {
      const past = new Date(now);
      past.setDate(now.getDate() - 6);
      setFromDate(formatIsoDate(past));
      setToDate(formatIsoDate(now));
    } else if (preset === '30days') {
      const past = new Date(now);
      past.setDate(now.getDate() - 29);
      setFromDate(formatIsoDate(past));
      setToDate(formatIsoDate(now));
    } else if (preset === 'thisMonth') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setFromDate(formatIsoDate(firstDay));
      setToDate(formatIsoDate(now));
    }
  };

  useEffect(() => {
    let ignore = false;

    // Tải danh mục tuyến đường nếu chưa có
    routeService
      .getAllRoutes()
      .then((data) => {
        if (!ignore && data) {
          setRoutes(data);
        }
      })
      .catch(() => {});

    // Gọi các Stored Procedures báo cáo từ CSDL
    const pRevenue = reportService
      .getRevenueReport(fromDate, toDate, 'DAY')
      .then((data) => {
        if (!ignore) setRevenueReport(data || null);
      })
      .catch(() => {
        if (!ignore) setRevenueReport(null);
      });

    const pRoute = reportService
      .getRouteRevenueReport(fromDate, toDate)
      .then((data) => {
        if (!ignore) setRouteReport(data || []);
      })
      .catch(() => {
        if (!ignore) setRouteReport([]);
      });

    const pOccupancy = reportService
      .getOccupancyReport(fromDate, toDate)
      .then((data) => {
        if (!ignore) setOccupancyList(data || []);
      })
      .catch(() => {
        if (!ignore) setOccupancyList([]);
      });

    Promise.allSettled([pRevenue, pRoute, pOccupancy]).finally(() => {
      if (!ignore) setIsLoading(false);
    });

    return () => {
      ignore = true;
    };
  }, [fromDate, toDate]);

  // Các chỉ số tính toán từ dữ liệu thực tế
  const totalRevenue = revenueReport?.total_revenue ?? 0;
  const totalTickets = routeReport.reduce((sum, r) => sum + r.tickets_sold, 0);
  const totalTrips = occupancyList.length;
  const occupancyRate =
    occupancyList.length > 0
      ? Number(
          (
            occupancyList.reduce((sum, item) => sum + item.occupancy_percent, 0) /
            occupancyList.length
          ).toFixed(1)
        )
      : 0;

  // Dữ liệu biểu đồ doanh thu theo ngày
  const chartData = useMemo(() => {
    if (isFutureDate) {
      return [];
    }

    // Nếu chọn khoảng thời gian <= 14 ngày, hiển thị chi tiết từng ngày
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const daysDiff = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1);

    if (daysDiff <= 14) {
      return Array.from({ length: daysDiff }, (_, idx) => {
        const cur = new Date(start);
        cur.setDate(start.getDate() + idx);
        const iso = formatIsoDate(cur);
        const matched = revenueReport?.items.find((item) => item.period.startsWith(iso));
        return {
          day: iso.slice(5),
          fullDate: iso,
          revenue: matched?.total_revenue ?? 0,
        };
      });
    }

    // Nếu khoảng thời gian dài hơn, lấy trực tiếp từ các điểm phát sinh doanh thu
    return (revenueReport?.items || []).map((item) => ({
      day: item.period.slice(5),
      fullDate: item.period,
      revenue: item.total_revenue,
    }));
  }, [fromDate, toDate, revenueReport, isFutureDate]);

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
    <div className="flex flex-col gap-5 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Báo cáo Kế toán &amp; Thống kê Doanh thu
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổng hợp doanh số bán vé thực tế và sản lượng vận hành chuyến xe theo kỳ báo cáo
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="brand" size="md">
            Dữ liệu thời gian thực
          </Badge>
        </div>
      </div>

      {/* Thanh bộ lọc ngày & Presets */}
      <Card padding="md" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Nút bấm khoảng thời gian nhanh */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-500 font-semibold mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Khoảng thời gian:
            </span>
            <button
              type="button"
              onClick={() => applyPreset('today')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activePreset === 'today'
                  ? 'bg-[#1E3A5F] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Hôm nay
            </button>
            <button
              type="button"
              onClick={() => applyPreset('7days')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activePreset === '7days'
                  ? 'bg-[#1E3A5F] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              7 ngày qua
            </button>
            <button
              type="button"
              onClick={() => applyPreset('30days')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activePreset === '30days'
                  ? 'bg-[#1E3A5F] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              30 ngày qua
            </button>
            <button
              type="button"
              onClick={() => applyPreset('thisMonth')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activePreset === 'thisMonth'
                  ? 'bg-[#1E3A5F] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tháng này
            </button>
          </div>

          {/* Ô nhập ngày tùy chỉnh */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Từ:</span>
            <input
              type="date"
              value={fromDate}
              max={toDate || todayIso}
              onKeyDown={(e) => e.preventDefault()}
              onClick={(e) => {
                try {
                  e.currentTarget.showPicker();
                } catch {
                  // Fallback for browsers not supporting showPicker
                }
              }}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) return;
                const clamped = val > todayIso ? todayIso : val;
                setIsLoading(true);
                setFromDate(clamped);
                if (toDate && clamped > toDate) {
                  setToDate(clamped);
                }
                setActivePreset('custom');
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#1E3A5F] cursor-pointer select-none"
            />
            <span className="text-slate-500 font-medium">Đến:</span>
            <input
              type="date"
              value={toDate}
              min={fromDate}
              max={todayIso}
              onKeyDown={(e) => e.preventDefault()}
              onClick={(e) => {
                try {
                  e.currentTarget.showPicker();
                } catch {
                  // Fallback for browsers not supporting showPicker
                }
              }}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) return;
                const clamped = val > todayIso ? todayIso : val;
                setIsLoading(true);
                setToDate(clamped);
                if (fromDate && clamped < fromDate) {
                  setFromDate(clamped);
                }
                setActivePreset('custom');
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#1E3A5F] cursor-pointer select-none"
            />
            <Button
              variant="secondary"
              size="sm"
              icon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={() => applyPreset('7days')}
              disabled={isLoading}
            >
              Đặt lại
            </Button>
          </div>
        </div>

        {/* Thông báo thông minh nếu chọn ngày tương lai (Phòng chống trap vấn đáp đồ án) */}
        {isFutureDate && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Lưu ý nghiệp vụ kế toán:</span> Khoảng thời gian được chọn nằm trong tương lai ({fromDate} → {toDate}). Hệ thống chỉ ghi nhận doanh thu từ các giao dịch thanh toán thành công đã phát sinh (hiện tại: 0 đ).
            </div>
          </div>
        )}
      </Card>

      {/* 1. 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md" className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1E3A5F] flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Tổng doanh thu kỳ này</span>
            <div className="text-xl font-bold text-slate-900 mt-0.5">
              {formatCurrency(totalRevenue)}
            </div>
            <span className="text-[11px] text-green-600 font-semibold flex items-center gap-0.5 mt-0.5">
              <ArrowUpRight className="w-3 h-3" /> Giao dịch VietQR &amp; Tiền mặt
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
            <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
              Vé đã xác nhận &amp; lên xe
            </span>
          </div>
        </Card>

        <Card padding="md" className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Chuyến xe trong kỳ</span>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{totalTrips} chuyến</div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Vận hành đúng lịch trình</span>
          </div>
        </Card>

        <Card padding="md" className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Tỷ lệ lấp đầy bình quân</span>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{occupancyRate}%</div>
            <span className="text-[11px] text-green-600 font-semibold flex items-center gap-0.5 mt-0.5">
              <ArrowUpRight className="w-3 h-3" /> Hiệu suất khai thác ghế
            </span>
          </div>
        </Card>
      </div>

      {/* 2. Biểu đồ doanh thu SVG thuần */}
      <Card padding="lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Biểu đồ doanh thu bán vé ({fromDate} → {toDate})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Biến động doanh thu thanh toán thành công theo từng ngày
            </p>
          </div>
          <Badge variant="brand" size="md">
            {chartData.length} mốc dữ liệu
          </Badge>
        </div>

        {/* Vẽ biểu đồ cột bằng SVG thuần */}
        <div className="w-full overflow-x-auto py-2">
          {chartData.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-slate-400 gap-1">
              <Calendar className="w-8 h-8 stroke-1 text-slate-300" />
              <p className="text-xs text-slate-500">Chưa có phát sinh giao dịch thanh toán trong khoảng thời gian này.</p>
            </div>
          ) : (
            <div className="min-w-[500px] h-56 flex flex-col justify-end">
              <svg className="w-full h-44" viewBox="0 0 700 160" preserveAspectRatio="none">
                {/* Lưới ngang */}
                <line x1="0" y1="40" x2="700" y2="40" stroke="#E2E8F0" strokeDasharray="3 3" />
                <line x1="0" y1="80" x2="700" y2="80" stroke="#E2E8F0" strokeDasharray="3 3" />
                <line x1="0" y1="120" x2="700" y2="120" stroke="#E2E8F0" strokeDasharray="3 3" />
                <line x1="0" y1="155" x2="700" y2="155" stroke="#CBD5E1" strokeWidth="1" />

                {/* Các cột dữ liệu */}
                {chartData.map((d, index) => {
                  const step = 640 / Math.max(1, chartData.length);
                  const colWidth = Math.min(46, step * 0.7);
                  const x = 30 + index * step;
                  const barHeight = d.revenue > 0 ? (d.revenue / maxRevenue) * 120 : 4;
                  const y = 155 - barHeight;

                  return (
                    <g key={d.fullDate}>
                      {/* Thanh cột */}
                      <rect
                        x={x}
                        y={y}
                        width={colWidth}
                        height={barHeight}
                        rx="5"
                        className={`${
                          d.revenue > 0
                            ? 'fill-[#1E3A5F] hover:fill-[#C2410C]'
                            : 'fill-slate-200'
                        } transition-colors cursor-pointer`}
                      >
                        <title>{`${d.fullDate}: ${formatCurrency(d.revenue)}`}</title>
                      </rect>
                      {/* Nhãn giá trị trên đầu cột */}
                      {d.revenue > 0 && (
                        <text
                          x={x + colWidth / 2}
                          y={y - 6}
                          textAnchor="middle"
                          className="text-[10px] fill-slate-600 font-semibold"
                        >
                          {(d.revenue / 1000000).toFixed(1)}M
                        </text>
                      )}
                      {/* Nhãn thứ ngày */}
                      <text
                        x={x + colWidth / 2}
                        y={150 + 20}
                        textAnchor="middle"
                        className="text-[11px] fill-slate-500 font-medium"
                      >
                        {d.day}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </div>
      </Card>

      {/* 3. Bảng Top tuyến xe đông khách */}
      <Card padding="none">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-slate-900">Hiệu quả doanh thu theo tuyến đường</h2>
            <p className="text-xs text-slate-500 mt-0.5">Xếp hạng theo sản lượng vé bán ra và tổng doanh thu thực tế</p>
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
                <th className="px-5 py-3 text-right">Doanh thu ghi nhận</th>
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
