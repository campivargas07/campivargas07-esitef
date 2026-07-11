import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { users } from "@esitef/db";
import { verifyUserCredentials } from "@/lib/auth/credentials";
import { getDb } from "@/lib/db";

const loginSchema = z.object({
  email: z.string().email().transform((e) => e.trim().toLowerCase()),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        return verifyUserCredentials(parsed.data.email, parsed.data.password);
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/ingresar" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "student";
      }
      return token;
    },
    async session({ session, token }) {
      if (!session.user) return session;

      const email = session.user.email?.toLowerCase();
      if (email) {
        const [user] = await getDb()
          .select({ id: users.id, role: users.role })
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (user) {
          session.user.id = user.id;
          (session.user as { role?: string }).role = user.role;
          return session;
        }
      }

      // ponytail: JWT con sub obsoleto tras reset de DB — no reutilizar token.sub
      delete (session.user as { id?: string }).id;
      return session;
    },
  },
});
