import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

// Extend the Session type to include accessToken and role
interface ExtendedSession extends Session {
  accessToken?: string;
  user: Session["user"] & {
    id?: string;
    role?: string;
  };
}

// Extend the JWT type to include accessToken and other properties
interface ExtendedJWT extends JWT {
  accessToken?: string;
  accessTokenExpires?: number;
  refreshToken?: string;
  role?: string;
}

export const authOptions: NextAuthOptions = {
  debug: true, // Enable debug logging
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID || "7c9eea42-317c-42c8-a209-f58bd88099bc",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID || "c439d10b-6cb0-4b9f-8410-5bdafdb624ec",
    }),
    // Add credentials provider for local admin login
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        console.log("Attempting to authorize admin credentials");
        
        try {
          // Check if the credentials match the admin account
          const username = credentials?.username;
          const password = credentials?.password;
          
          console.log("Checking credentials", { username, hasPassword: !!password });
          
          // Simple static check for the admin account
          if (username === "admin" && password === "password123!") {
            console.log("Admin credentials matched");
            // Return a user object for successful authentication
            return {
              id: "admin-user",
              name: "Administrator",
              email: "admin@example.com",
              role: "admin",
            };
          }
          
          console.log("Admin credentials did not match");
          // Authentication failed
          return null;
        } catch (error) {
          console.error("Error in authorize function:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, credentials }) {
      console.log("signIn callback", { user: !!user, account: !!account, hasCredentials: !!credentials });
      // Allow credential-based sign-in and SSO sign-in
      return true;
    },
    async session({ session, token }) {
      console.log("session callback", { session: !!session, token: !!token });
      const extendedSession = session as ExtendedSession;
      
      if (token.sub) {
        extendedSession.user.id = token.sub;
      }
      if (token.accessToken) {
        extendedSession.accessToken = token.accessToken as string;
      }
      // Add role to session if available
      if (token.role) {
        extendedSession.user.role = token.role as string;
      }
      // Make sure user is defined in the session
      if (!extendedSession.user) {
        extendedSession.user = {
          id: token.sub as string,
          name: token.name as string,
          email: token.email as string,
          role: (token.role as string) || undefined,
        };
      }
      return extendedSession;
    },
    async jwt({ token, account, user }) {
      console.log("jwt callback", { token: !!token, account: !!account, user: !!user });
      const extendedToken = token as ExtendedJWT;
      
      // Initial sign-in
      if (user) {
        // Map user properties to token
        extendedToken.name = user.name || 'Unknown';
        extendedToken.email = user.email;
        extendedToken.role = (user as any).role;
        
        // Add OAuth properties if they exist
        if (account) {
          extendedToken.accessToken = account.access_token;
          extendedToken.accessTokenExpires = account.expires_at ? account.expires_at * 1000 : 0;
          extendedToken.refreshToken = account.refresh_token;
        }
      }
      return extendedToken;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "your-default-secret-do-not-use-in-production",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
