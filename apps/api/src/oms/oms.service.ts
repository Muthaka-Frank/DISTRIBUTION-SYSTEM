import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OmsService {
    constructor(private prisma: PrismaService) { }

    async createOrder(createOrderDto: CreateOrderDto) {
        const { hospitalId, items } = createOrderDto;

        // 1. Basic Validation: Check if hospital exists
        const hospital = await this.prisma.hospital.findUnique({
            where: { id: hospitalId },
        });
        if (!hospital) {
            throw new BadRequestException('Invalid Hospital ID');
        }

        // 2. Transaction with Optimistic Concurrency Control
        return this.prisma.$transaction(async (tx) => {
            let totalPrice = 0;

            // Check stock and deduct for all items with OCC
            for (const item of items) {
                // Read current state
                const inventory = await tx.inventory.findUnique({
                    where: { id: item.inventoryId },
                });

                if (!inventory || inventory.quantity < item.quantity) {
                    throw new BadRequestException(
                        `Insufficient stock for Item ${item.inventoryId} (Available: ${inventory?.quantity || 0})`,
                    );
                }

                // Simulating price fetching
                const pricePerUnit = 10;
                totalPrice += pricePerUnit * item.quantity;

                // OCC: Update only if version matches
                const updatedInventory = await tx.inventory.updateMany({
                    where: {
                        id: item.inventoryId,
                        version: inventory.version, // Check version
                    },
                    data: {
                        quantity: { decrement: item.quantity },
                        version: { increment: 1 }, // Atomically increment version
                    },
                });

                if (updatedInventory.count === 0) {
                    throw new BadRequestException(
                        `Concurrency Conflict: Item ${item.inventoryId} was modified by another transaction. Please retry.`,
                    );
                }
            }

            // Create Order
            const order = await tx.order.create({
                data: {
                    hospitalId,
                    totalPrice,
                    status: 'PENDING',
                    items: {
                        create: items.map((item) => ({
                            inventoryId: item.inventoryId,
                            quantity: item.quantity,
                        })),
                    },
                },
                include: { items: true },
            });

            // 3. Audit Trail (Mock User ID - in real app, get from Request)
            // Assuming a system user or admin for this context
            // Note: We need a valid User ID for the audit log.
            // For now, we will skip creating the audit log if no user exists,
            // or we should create a seed user.
            // Let's assume the hospital manager (first user linked to hospital) does it, or mock a system user.
            // To keep it simple and robust for this demo, we will query a user or create a temporary system log.

            const systemUser = await tx.user.findFirst();
            if (systemUser) {
                await tx.auditLog.create({
                    data: {
                        userId: systemUser.id,
                        action: 'CREATE_ORDER',
                        resource: `Order:${order.id}`,
                        details: JSON.stringify({ totalPrice, itemsCount: items.length }),
                    }
                });
            }

            return order;
        });
    }
}
