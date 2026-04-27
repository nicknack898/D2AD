import NextAuth from "next-auth"
import Discord from "next-auth/providers/discord"
import type { Provider } from "next-auth/providers"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { eq } from "drizzle-orm"
import { getDb, schema } from "@/src/db"

function steamOpenIdProvider(): Provider {
  return {
    id: "steam",
    name: "Steam",
    type: "oauth",
    authorization: {
      url: "https://steamcommunity.com/openid/login",
      params: {
        "openid.mode": "checkid_setup",
        "openid.ns": "http://specs.openid.net/auth/2.0",
        "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
        "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
      },
    },
    token: "https://steamcommunity.com/openid/login",
    userinfo: {
      async request() {
        return { id: "" }
      },
    },
    profile(_profile) {
      return {
        id: "",
        name: "Steam User",
        email: null,
      }
    },
    checks: [],
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: DrizzleAdapter(getDb()),
  providers: [
    Discord({
      clientId: process.env.AUTH_DISCORD_ID ?? "",
      clientSecret: process.env.AUTH_DISCORD_SECRET ?? "",
    }),
    steamOpenIdProvider(),
  ],
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider !== "steam") {
        return true
      }

      const candidateSteamId =
        typeof profile?.sub === "string"
          ? profile.sub
          : typeof user?.id === "string"
            ? user.id
            : null

      if (!candidateSteamId || !user.id) {
        return true
      }

      await getDb()
        .update(schema.players)
        .set({ steamId: candidateSteamId })
        .where(eq(schema.players.id, Number(user.id)))

      return true
    },
    async session({ session, user }) {
      if (session.user && user?.id) {
        ;(session.user as typeof session.user & { id: string }).id = user.id
      }
      return session
    },
  },
})
