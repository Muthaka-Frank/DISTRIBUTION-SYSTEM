import { PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    const passwordHash = await hash('password123', 10);

    // 1. Create a Hospital
    const hospital = await prisma.hospital.upsert({
        where: { id: 'hospital-1' },
        update: {},
        create: {
            id: 'hospital-1',
            name: 'City General Hospital',
            location: '123 Medical Drive, Nairobi',
            contactInfo: '+254 700 000 000',
            creditLimit: 50000,
            balance: 0,
        },
    });
    console.log(`🏥 Created Hospital: ${hospital.name}`);

    // 2. Create Inventory Items (Medicines)
    const panadol = await prisma.inventory.upsert({
        where: { sku: 'MED-001' },
        update: {},
        create: {
            sku: 'MED-001',
            name: 'Panadol Extra',
            description: 'Pain relief tablets',
            batchNumber: 'BATCH-2024-X',
            expiryDate: new Date('2025-12-31'),
            quantity: 5000,
            warehouseLocation: 'Zone-A-Rack-1',
        },
    });

    const amoxicillin = await prisma.inventory.upsert({
        where: { sku: 'MED-002' },
        update: {},
        create: {
            sku: 'MED-002',
            name: 'Amoxicillin 500mg',
            description: 'Antibiotic capsules',
            batchNumber: 'BATCH-2024-Y',
            expiryDate: new Date('2024-10-15'),
            quantity: 2000,
            warehouseLocation: 'Zone-B-Rack-3',
        },
    });
    console.log(`💊 Created Inventory: ${panadol.name}, ${amoxicillin.name}`);

    // 3. Create Users
    // Admin (HQ)
    const admin = await prisma.user.upsert({
        where: { email: 'admin@hq.com' },
        update: { password: passwordHash, mustChangePassword: false },
        create: {
            email: 'admin@hq.com',
            password: passwordHash,
            name: 'System Administrator',
            role: Role.ADMIN,
            mustChangePassword: false,
        },
    });
    console.log(`👤 Created Admin: ${admin.email}`);

    // Driver
    const driver = await prisma.user.upsert({
        where: { email: 'driver@logistics.com' },
        update: { password: passwordHash, mustChangePassword: false },
        create: {
            email: 'driver@logistics.com',
            password: passwordHash,
            name: 'John Driver',
            role: Role.DRIVER,
            mustChangePassword: false,
        },
    });
    console.log(`🚚 Created Driver: ${driver.name}`);

    // Hospital Manager
    const manager = await prisma.user.upsert({
        where: { email: 'manager@hospital.com' },
        update: { password: passwordHash, hospitalId: hospital.id, mustChangePassword: false },
        create: {
            email: 'manager@hospital.com',
            password: passwordHash,
            name: 'Dr. Sarah Smith',
            role: Role.HOSPITAL_MANAGER,
            hospitalId: hospital.id,
            mustChangePassword: false,
        },
    });
    console.log(`🏥 Created Hospital Manager: ${manager.name}`);

    console.log('✅ Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
