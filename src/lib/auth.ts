import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

// Create a new Prisma client for auth to avoid connection issues
const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Admin Login',
            credentials: {
                email: { label: 'メールアドレス', type: 'email' },
                password: { label: 'パスワード', type: 'password' },
            },
            async authorize(credentials) {
                console.log('=== Auth attempt ===');
                console.log('Email:', credentials?.email);

                if (!credentials?.email || !credentials?.password) {
                    console.log('Missing credentials');
                    return null;
                }

                try {
                    // データベースから管理者ユーザーを検索
                    console.log('Searching for admin user...');
                    const adminUser = await prisma.adminUser.findUnique({
                        where: { email: credentials.email },
                    });

                    if (!adminUser) {
                        console.log('Admin user not found');
                        return null;
                    }

                    console.log('Admin user found:', adminUser.id);

                    // パスワードを検証
                    const isValid = await bcrypt.compare(credentials.password, adminUser.passwordHash);
                    console.log('Password valid:', isValid);

                    if (!isValid) {
                        return null;
                    }

                    return {
                        id: adminUser.id,
                        email: adminUser.email,
                        name: 'Admin',
                    };
                } catch (error) {
                    console.error('Auth error:', error);
                    return null;
                }
            },
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 24 * 60 * 60, // 24 hours
    },
    pages: {
        signIn: '/admin/login',
        error: '/admin/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as { id: string }).id = token.id as string;
            }
            return session;
        },
    },
    debug: true,
};
