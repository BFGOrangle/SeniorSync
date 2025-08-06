/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

/**
 * SeniorSync Authentication Configuration
 * 
 * Uses backend JWT tokens for API authentication with:
 * - Center-based multi-tenancy
 * - Secure backend-generated JWT tokens
 * - User and center information
 */
const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          if (!res.ok) {
            console.error('Authentication failed:', res.status)
            return null
          }

          const userData = await res.json()
          
          if (userData.staffId && userData.email && userData.token) {
            return {
              id: userData.staffId.toString(),
              email: userData.email,
              name: `${userData.firstName} ${userData.lastName}`,
              role: userData.roleType,
              jobTitle: userData.jobTitle,
              firstName: userData.firstName,
              lastName: userData.lastName,
              centerId: userData.centerId,
              centerName: userData.centerName,
              backendToken: userData.token, // Store the backend JWT token
            }
          }

          return null
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.role = user.role
        token.jobTitle = user.jobTitle
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.centerId = user.centerId
        token.centerName = user.centerName
        token.backendToken = user.backendToken // Store backend JWT token
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.sub as string
        session.user.role = token.role as string
        session.user.jobTitle = token.jobTitle as string
        session.user.firstName = token.firstName as string
        session.user.lastName = token.lastName as string
        session.user.centerId = token.centerId as number
        session.user.centerName = token.centerName as string
        
        // Use the backend-generated JWT token directly
        session.accessToken = token.backendToken as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST } 