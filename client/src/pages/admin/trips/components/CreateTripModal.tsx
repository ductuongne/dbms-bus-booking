import React, { useState, useEffect } from 'react';
import type { RouteListItem } from '../../../../services/route.service';
import type { BusListItemView } from '../../../../types';
import type { CreateTripPayload } from '../../../../services/trip.service';
import { userService, type DriverOption } from '../../../../services/user.service';
import { Modal, Input, Button } from '../../../../components/common';
import { useToast } from '../../../../hooks/useToast';

export interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  routes: RouteListItem[];
  buses: BusListItemView[];
  onSubmit: (payload: CreateTripPayload) => Promise<void>;
}

export const CreateTripModal: React.FC<CreateTripModalProps> = ({
  isOpen,
  onClose,
  routes,
  buses,
  onSubmit,
}) => {
  const { error: toastError } = useToast();
  const [drivers, setDrivers] = useState<DriverOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formRouteId, setFormRouteId] = useState(routes[0]?.id || '');
  const [formBusId, setFormBusId] = useState(buses[0]?.id || '');
  const [formDriverId, setFormDriverId] = useState('');
  const [formDepartureTime, setFormDepartureTime] = useState('');
  const [formArrivalTime, setFormArrivalTime] = useState('');
  const [formPrice, setFormPrice] = useState<number>(250000);
  const [minDepartureIso] = useState<string>(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 1);
    return d.toISOString().slice(0, 16);
  });

  useEffect(() => {
    let ignore = false;
    userService
      .getDrivers()
      .then((data) => {
        if (!ignore && data && data.length > 0) {
          setDrivers(data);
          setFormDriverId((prev) => prev || data[0].driverId);
        }
      })
      .catch(() => {});

    return () => {
      ignore = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const routeId = formRouteId || routes[0]?.id;
    const busId = formBusId || buses[0]?.id;
    const driverId = formDriverId || drivers[0]?.driverId;

    if (!routeId || !busId || !driverId || !formDepartureTime || !formArrivalTime || !formPrice) {
      toastError('Vui lòng điền đầy đủ thông tin chuyến xe!');
      return;
    }

    const depDate = new Date(formDepartureTime);
    const arrDate = new Date(formArrivalTime);

    if (isNaN(depDate.getTime()) || isNaN(arrDate.getTime())) {
      toastError('Thời gian khởi hành hoặc thời gian đến không hợp lệ!');
      return;
    }

    if (depDate.getTime() <= Date.now()) {
      toastError('Thời gian khởi hành phải sau thời điểm hiện tại!');
      return;
    }

    if (arrDate.getTime() <= depDate.getTime()) {
      toastError('Thời gian đến dự kiến phải sau thời gian khởi hành!');
      return;
    }

    if (isNaN(formPrice) || formPrice <= 0) {
      toastError('Giá vé cơ bản phải là số dương lớn hơn 0 VNĐ!');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        route_id: routeId,
        bus_id: busId,
        driver_id: driverId,
        departure_time: depDate.toISOString(),
        arrival_time: arrDate.toISOString(),
        price: Number(formPrice),
      });
      onClose();
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : 'Không thể tạo chuyến xe!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm chuyến xe mới" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Tuyến đường</label>
          <select
            value={formRouteId || routes[0]?.id || ''}
            onChange={(e) => setFormRouteId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#1E3A5F]"
            required
          >
            {routes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.id}: {r.departureStationName} → {r.arrivalStationName} ({r.distanceKm} km)
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Xe khách vận hành</label>
            <select
              value={formBusId || buses[0]?.id || ''}
              onChange={(e) => setFormBusId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#1E3A5F]"
              required
            >
              {buses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.licensePlate} ({b.typeName} - {b.totalSeats} chỗ)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tài xế phân công</label>
            <select
              value={formDriverId || drivers[0]?.driverId || ''}
              onChange={(e) => setFormDriverId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#1E3A5F]"
              required
            >
              {drivers.length === 0 ? (
                <option value="">Đang tải danh sách tài xế...</option>
              ) : (
                drivers.map((d) => (
                  <option key={d.driverId} value={d.driverId}>
                    {d.driverId}: {d.fullName} ({d.phone} - GPLX: {d.licenseNumber})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Thời gian khởi hành</label>
            <Input
              type="datetime-local"
              value={formDepartureTime}
              min={minDepartureIso}
              onKeyDown={(e) => e.preventDefault()}
              onClick={(e) => {
                try {
                  (e.currentTarget as HTMLInputElement).showPicker?.();
                } catch {
                  // Fallback
                }
              }}
              onChange={(e) => setFormDepartureTime(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Thời gian đến dự kiến</label>
            <Input
              type="datetime-local"
              value={formArrivalTime}
              min={formDepartureTime || minDepartureIso}
              onKeyDown={(e) => e.preventDefault()}
              onClick={(e) => {
                try {
                  (e.currentTarget as HTMLInputElement).showPicker?.();
                } catch {
                  // Fallback
                }
              }}
              onChange={(e) => setFormArrivalTime(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Giá vé cơ bản (VNĐ)</label>
          <Input
            type="number"
            min="10000"
            step="10000"
            value={isNaN(formPrice) || formPrice === 0 ? '' : formPrice}
            onChange={(e) => setFormPrice(e.target.value === '' ? 0 : Number(e.target.value))}
            placeholder="VD: 250000"
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting}>
            Tạo chuyến xe
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTripModal;
