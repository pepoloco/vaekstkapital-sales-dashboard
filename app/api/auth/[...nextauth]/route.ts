import NextAuth, { NextAuthOptions } from "next-auth";

// ─────────────────────────────────────────────────────────────────
// Replace this with your existing authOptions configuration.
// If you already have NextAuth set up elsewhere in this project,
// import your authOptions from there instead.
// ─────────────────────────────────────────────────────────────────
export const authOptions: NextAuthOptions = {
  // Example: add your existing providers here
  // providers: [
  //   GoogleProvider({ clientId: process.env.GOOGLE_ID!, clientSecret: process.env.GOOGLE_SECRET! }),
  // ],
  providers: [],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/api/auth/signin",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
