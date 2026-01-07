import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddInventoryDto } from './dto/add-inventory.dto';

@Injectable()
export class WmsService {
    constructor(private prisma: PrismaService) { }

    async addInventory(dto: AddInventoryDto) {
        return this.prisma.inventory.create({
            data: {
                sku: dto.sku,
                name: dto.name,
                batchNumber: dto.batchNumber,
                expiryDate: new Date(dto.expiryDate),
                quantity: dto.quantity,
                warehouseLocation: dto.warehouseLocation,
            },
        });
    }

    async checkStock(sku: string) {
        return this.prisma.inventory.findFirst({
            where: { sku },
        });
    }

    // Serialization Logic (Mock)
    generateBarcode(sku: string, batchNumber: string) {
        // In a real system, this would generate a 2D DataMatrix code
        return `SN-${sku}-${batchNumber}-${Date.now()}`;
    }
}
