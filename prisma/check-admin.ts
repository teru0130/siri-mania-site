import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkAdmin() {
    console.log('Checking admin users in database...');

    const admins = await prisma.adminUser.findMany();
    console.log('Found admin users:', admins.length);

    for (const admin of admins) {
        console.log('---');
        console.log('ID:', admin.id);
        console.log('Email:', admin.email);
        console.log('PasswordHash length:', admin.passwordHash.length);

        // Test password verification
        const testPassword = 'Kami0130';
        const isValid = await bcrypt.compare(testPassword, admin.passwordHash);
        console.log('Password "Kami0130" valid:', isValid);
    }
}

checkAdmin()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
