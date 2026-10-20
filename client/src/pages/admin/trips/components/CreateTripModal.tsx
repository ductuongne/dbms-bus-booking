import React, { useState } from 'react';
import type { RouteListItem } from '../../../../services/route.service';
import type { BusListItemView } from '../../../../types';
import type { CreateTripPayload } from '../../../../services/trip.service';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formRouteId, setFormRouteId] = useState(routes[0]?.id || '');
  const [formBusId, setFormBusId] = useState(buses[0]?.id || '');
  const [formDriverId, setFormDriverId] = useState('USR-00000000-0000-0000-0000-000000000003');
  const [formDepartureTime, setFormDepartureTime] = useState('');
  const [formArrivalTime, setFormArrivalTime] = useState('');
  const [formPrice, setFormPrice] = useState<number>(250000);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const routeId = formRouteId || routes[0]?.id;
    const busId = formBusId || buses[0]?.id;

    if (!routeId || !busId || !formDepartureTime || !formArrivalTime || !formPrice) {
      toastError('Vui lòng điền đầy đủ thông tin chuyến xe!');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        route_id: routeId,
        bus_id: busId,
        driver_id: formDriverId,
        departure_time: new Date(formDepartureTime).toISOString(),
        arrival_time: new Date(formArrivalTime).toISOString(),
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Tuyến đường</label>
          <select
            value={formRouteId || routes[0]?.id || ''}
            onChange={(e) => setFormRouteId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
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
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mã tài xế (User ID)</label>
            <Input
              value={formDriverId}
              onChange={(e) => setFormDriverId(e.target.value)}
              placeholder="VD: USR-00000000-0000-0000-0000-000000000003"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Thời gian khởi hành</label>
            <Input
              type="datetime-local"
              value={formDepartureTime}
              onChange={(e) => setFormDepartureTime(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Thời gian đến dự kiến</label>
            <Input
              type="datetime-local"
              value={formArrivalTime}
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
            value={formPrice}
            onChange={(e) => setFormPrice(Number(e.target.value))}
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
