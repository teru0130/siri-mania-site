import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from './prisma';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Admin Login',
            credentials: {
                email: { label: 'メールアドレス', type: 'email' },
                password: { label: 'パスワード', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    // データベースから管理者ユーザーを検索
                    const adminUser = await prisma.adminUser.findUnique({
                        where: { email: credentials.email },
                    });

                    if (!adminUser) {
                        console.log('Admin user not found:', credentials.email);
                        return null;
                    }

                    // パスワードを検証
                    const isValid = await bcrypt.compare(credentials.password, adminUser.passwordHash);
                    if (!isValid) {
                        console.log('Invalid password for:', credentials.email);
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
};
