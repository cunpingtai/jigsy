import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { HttpsProxyAgent } from "https-proxy-agent";
import { custom } from "openid-client";
import { jwtDecode } from "jwt-decode";
if (process.env.https_proxy) {
  console.log("https_proxy", process.env.https_proxy);
  // Corporate proxy uses CA not in undici's certificate store
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  const agent = new HttpsProxyAgent(process.env.https_proxy);
  custom.setHttpOptionsDefaults({
    agent,
  });
}

const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
      profile(profile) {
        // console.log("Google profile data:", profile);
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          avatar: profile.picture,
        };
      },
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Google One Tap",
      credentials: {
        credential: { label: "Credential", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.credential) return null;

          // 解码 Google ID Token
          const decoded = jwtDecode<{
            email: string;
            name: string;
            picture: string;
            sub: string; // 这是 Google 用户 ID
          }>(credentials.credential);

          console.log("解码的 Google One Tap 凭证:", decoded);

          if (!decoded.email) return null;

          // 查找或创建用户
          let user = await prisma.user.findUnique({
            where: { email: decoded.email },
          });

          if (!user) {
            // 创建新用户
            user = await prisma.user.create({
              data: {
                name: decoded.name || "",
                email: decoded.email,
                image: decoded.picture || "",
                avatar: decoded.picture || "",
              },
            });
            console.log("通过 One Tap 创建的新用户:", user);
          }

          // 查找是否已存在 Google 账户
          const existingAccount = await prisma.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider: "google",
                providerAccountId: decoded.sub,
              },
            },
          });

          // 如果不存在账户，创建一个
          if (!existingAccount) {
            const newAccount = await prisma.account.create({
              data: {
                userId: user.id,
                type: "oauth", // 使用 oauth 类型以保持一致性
                provider: "google",
                providerAccountId: decoded.sub,
                // 由于 One Tap 没有提供这些字段，我们设置一些基本值
                access_token: "one-tap-login",
                token_type: "Bearer",
                scope: "openid email profile",
                id_token: credentials.credential,
              },
            });
          }

          // 返回用户信息
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            avatar: user.avatar,
          };
        } catch (error) {
          console.error("Google One Tap 登录错误:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // console.log("Sign in callback - user:", user);
      // console.log("Sign in callback - account:", account);

      if (!user.email) {
        console.error("用户没有邮箱，无法创建账户");
        return false;
      }

      try {
        // 手动检查用户是否存在
        let dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        // console.log("数据库中的用户:", dbUser);

        // 如果用户不存在，手动创建
        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              name: user.name || "",
              email: user.email,
              image: user.image || "",
              avatar: user.image || "",
            },
          });
          // console.log("创建的新用户:", dbUser);

          // 如果有账户信息，创建关联的账户
          if (account) {
            const newAccount = await prisma.account.create({
              data: {
                userId: dbUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                refresh_token: account.refresh_token,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state,
              },
            });
            // console.log("创建的新账户:", newAccount);
          }
        }

        return true;
      } catch (error) {
        console.error("登录回调中的错误:", error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      // console.log("JWT 回调 - token:", token);
      // console.log("JWT 回调 - user:", user);

      if (user) {
        token.id = user.id;
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // console.log("会话回调 - session:", session);
      // console.log("会话回调 - token:", token);

      if (session.user) {
        session.user.id = token.sub || "";
      }
      return session;
    },
  },
  events: {
    async createUser(message) {
      // console.log("用户创建事件:", message);
    },
    async linkAccount(message) {
      // console.log("账户关联事件:", message);
    },
    async signIn(message) {
      // console.log("登录事件:", message);
    },
  },
  debug: true,
  pages: {
    signIn: "/",
    error: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30天
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
