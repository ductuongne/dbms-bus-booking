export type TripStatus = 'SCHEDULED' | 'DEPARTED' | 'COMPLETED' | 'CANCELLED'

export interface DriverScheduleDto {
	tripId: string
	driverId: string
	userId: string
	driverName: string
	driverPhone: string
	licenseNumber: string
	departureTime: string
	arrivalTime: string
	tripStatus: TripStatus
	routeId: string
	departureStation: string
	arrivalStation: string
	distanceKm: number
	licensePlate: string
	busType: string
	totalSeats: number
}
