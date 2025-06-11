
import prisma from "@/app/lib/db/db"
import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter:PrismaAdapter(prisma),
  providers: [Google],
  callbacks: {
    // async redirect({ url, baseUrl }) {
    //   // Allow relative callback URLs
    //   if (url.startsWith("/")) return `${baseUrl}${url}`
    //   // Prevent external redirects
    //   if (new URL(url).origin !== baseUrl) return baseUrl
    //   return url
    // }
    async redirect({ url, baseUrl }) {
    // Always redirect to /chat after sign-in
    return "/chat";
  },
  },
  pages: {
    signIn: "/signin",
    signOut: "/signout",
    error: "/error", // Error code passed in query string as ?error=
    verifyRequest: "/verify-request", // (used for check email message)
    newUser: "/new-user" // Will disable the new account creation screen
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
    // jwt: {
    //   maxAge: 30 * 24 * 60 * 60, // 30 days
    //   updateAge: 24 * 60 * 60, // 24 hours
    // }
  },
  secret: process.env.NEXTAUTH_SECRET,
  theme: {
    colorScheme: "light", // "auto" | "dark" | "light"
    brandColor: "#000000", // Hex color code
    logo: "/logo.png", // Absolute URL to the logo
  },
  events: {
    async signIn(message) {
      console.log("User signed in:", message.user);
    },
    async signOut(message) {
      console.log("User signed out:", message);
    },
    async createUser(message) {
      console.log("New user created:", message.user);
    }
  },
  debug: process.env.NODE_ENV === "development", // Enable debug messages in development
  trustHost: true, // Trust the host for redirects
  
})
