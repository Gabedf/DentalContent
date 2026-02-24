import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, profile }) {
      // Na primeira autenticação, troca o token do Google pelo JWT do nosso backend
      if (account?.provider === 'google' && profile) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              google_id: profile.sub,
              email: profile.email,
              name: profile.name,
              avatar: (profile as any).picture,
            }),
          })
          const data = await res.json()
          if (data.token) {
            token.backendToken = data.token
            token.backendUser = data.user
          }
        } catch (err) {
          console.error('Erro ao autenticar com backend:', err)
        }
      }
      return token
    },
    async session({ session, token }) {
      // Expõe o JWT do backend na sessão
      (session as any).backendToken = token.backendToken;
      (session as any).backendUser = token.backendUser;
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
})

export { handler as GET, handler as POST }