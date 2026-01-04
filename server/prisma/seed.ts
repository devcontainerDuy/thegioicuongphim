import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // 1. Create permissions
    const permissions = [
        { slug: 'movie.create', description: 'Create new movies' },
        { slug: 'movie.update', description: 'Update movies' },
        { slug: 'movie.delete', description: 'Delete movies' },
        { slug: 'user.read', description: 'View user list' },
        { slug: 'user.update', description: 'Update users' },
        { slug: 'user.delete', description: 'Delete users' },
        { slug: 'role.manage', description: 'Manage roles and permissions' },
        { slug: 'settings.manage', description: 'Manage system settings' },
    ];

    for (const p of permissions) {
        await prisma.permission.upsert({
            where: { slug: p.slug },
            update: {},
            create: p,
        });
    }

    // 2. Create Roles
    const adminRole = await prisma.role.upsert({
        where: { name: 'Admin' },
        update: {},
        create: {
            name: 'Admin',
            description: 'System Administrator',
            permissions: {
                connect: permissions.map((p) => ({ slug: p.slug })),
            },
        },
    });

    const vipRole = await prisma.role.upsert({
        where: { name: 'VIP' },
        update: {},
        create: {
            name: 'VIP',
            description: 'Paid Subscriber',
            permissions: {
                // VIP might have specific permissions later
            },
        },
    });

    const userRole = await prisma.role.upsert({
        where: { name: 'User' },
        update: {},
        create: {
            name: 'User',
            description: 'Standard User',
        },
    });

    // 3. Create Admin User
    const adminEmail = 'admin@movie.com'; // Default admin email
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'; // Default password
    const hashedPassword = await import('bcrypt').then(m => m.hash(adminPassword, 10));

    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            name: 'Super Admin',
            password: hashedPassword,
            isRoot: true,
            role: {
                connect: { name: 'Admin' }
            }
        }
    });

    console.log(`Admin user created: ${adminEmail} / ${adminPassword}`);

    console.log('Roles and Permissions seeded.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
