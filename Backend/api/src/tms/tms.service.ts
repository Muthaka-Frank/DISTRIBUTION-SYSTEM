import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShipmentDto, UpdateLocationDto } from './dto/tms.dto';

@Injectable()
export class TmsService {
  constructor(private prisma: PrismaService) {}

  async createShipment(dto: CreateShipmentDto) {
    return this.prisma.shipment.create({
      data: {
        orderId: dto.orderId,
        driverId: dto.driverId,
        vehicleId: dto.vehicleId,
        status: 'PREPARING',
      },
    });
  }

  async updateLocation(shipmentId: string, dto: UpdateLocationDto) {
    return this.prisma.shipment.update({
      where: { id: shipmentId },
      data: {
        currentLat: dto.lat,
        currentLng: dto.lng,
        status: 'IN_TRANSIT',
      },
    });
  }

  async recordTemperature(
    shipmentId: string,
    temperature: number,
    sensorId: string,
  ) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id: shipmentId },
    });
    if (!shipment) throw new NotFoundException('Shipment not found');

    // Threshold check (mock alert)
    if (temperature > 8.0 || temperature < 2.0) {
      console.warn(
        `[ALERT] Shipment ${shipmentId} temperature excursion: ${temperature}°C`,
      );
      // In real system: Trigger notification service
    }

    return this.prisma.coldChainLog.create({
      data: {
        shipmentId,
        sensorId,
        temperature,
      },
    });
  }
}
