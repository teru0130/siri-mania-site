import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

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

                const adminEmail = process.env.ADMIN_EMAIL;
                const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

                if (!adminEmail || !adminPasswordHash) {
                    console.error('Admin credentials not configured');
                    return null;
                }

                if (credentials.email !== adminEmail) {
                    return null;
                }

                const isValid = await bcrypt.compare(credentials.password, adminPasswordHash);
                if (!isValid) {
                    return null;
                }

                return {
                    id: '1',
                    email: adminEmail,
                    name: 'Admin',
                };
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
