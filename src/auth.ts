import NextAuth from "next-auth"
import Discord from "next-auth/providers/discord"
import Credentials from "next-auth/providers/credentials"
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
    profile() {
      return {
        id: "",
        name: "Steam User",
        email: null,
      }
    },
    checks: [],
  }
}

function getProviders(): Provider[] {
  const providers: Provider[] = []

  if (process.env.AUTH_DISCORD_ID && process.env.AUTH_DISCORD_SECRET) {
    providers.push(
      Discord({
        clientId: process.env.AUTH_DISCORD_ID,
        clientSecret: process.env.AUTH_DISCORD_SECRET,
      }),
    )
  }

  if (process.env.AUTH_ENABLE_STEAM === "true") {
    providers.push(steamOpenIdProvider())
  }

  if (providers.length === 0) {
    providers.push(
      Credentials({
        id: "disabled-auth",
        name: "Disabled Auth",
        credentials: {},
        authorize: async () => null,
      }),
    )
  }

  return providers
}

const adapter = process.env.DATABASE_URL ? DrizzleAdapter(getDb()) : undefined

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter,
  session: {
    strategy: adapter ? "database" : "jwt",
  },
  providers: getProviders(),
  callbacks: {
    async signIn({ account, profile, user }) {
      if (!adapter || account?.provider !== "steam") {
        return true
      }

      const candidateSteamId = typeof profile?.sub === "string" ? profile.sub : null
      if (!candidateSteamId || !user.id || Number.isNaN(Number(user.id))) {
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
