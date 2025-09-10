import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  session: {


 trustHost: true,  
 strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,

  },

  // Security configurations
  secret: process.env.NEXTAUTH_SECRET || 'aidfjnvociydfnovfadf',
  useSecureCookies: process.env.NODE_ENV === 'production',
  trustHost: true,

  // Cookie settings
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.fx-references.com' : undefined
      }
    },
    callbackUrl: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },

  // JWT settings
  jwt: {
    encryption: true,
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        token: { label: "Token", type: "text" },
        role: { label: "Role", type: "text" },
        id: { label: "ID", type: "text" },
      },
      async authorize(credentials, req) {
        try {
          // Add your authentication logic here
          if (!credentials?.token || !credentials?.id) {
            throw new Error("Missing required credentials");
          }

          // Example: Verify token with your backend
          // const user = await verifyToken(credentials.token);
          // if (!user) return null;

          return {
            token: credentials.token,
            role: credentials.role,
            id: credentials.id
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      }
    })
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user && account) {
        console.log("JWT user data:", user);
        token.user = {
          token: user.token,
          role: user.role,
          id: user.id,
        };
      }
      return token;
    },

    async session({ session, token }) {
      if (token?.user) {
        session.user = token.user;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      return url.startsWith(baseUrl) ? url : baseUrl;
    }
  },

  pages: {
    signIn: '/sign-in',
    signOut: '/auth/signout',
    error: '/sign-in?error=',
    verifyRequest: '/auth/verify-request',
  },

  // Enable debug in both development and production temporarily
  debug: true,

  // Security
  csrf: {
    check: true,
  },
  logger: {
    error(code, metadata) {
      console.error(code, metadata);
    },
    warn(code) {
      console.warn(code);
    },
    debug(code, metadata) {
      console.debug(code, metadata);
    }
  }
});

export { handler as GET, handler as POST };
