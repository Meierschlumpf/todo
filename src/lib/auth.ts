import { APIError, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Check whitelist only if WHITELIST_EMAILS is set
          const whitelistEnv = process.env.WHITELIST_EMAILS?.trim();
          if (whitelistEnv) {
            const whitelist = whitelistEnv.split(",").map(email => email.trim().toLowerCase());
            const userEmail = user.email.toLowerCase();
            
            if (!whitelist.includes(userEmail)) {
              throw new APIError("FORBIDDEN", {
                message: "NOT_WHITELISTED",
              });
            }
          }

          return {
            data: user,
          };
        },
      },
    },
  },
  onAPIError: {
    errorURL: "/login",
  },
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
});

export type Session = typeof auth.$Infer.Session;
