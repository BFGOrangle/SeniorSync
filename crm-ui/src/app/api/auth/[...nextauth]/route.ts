import NextAuth from 'next-auth/next'
import CredentialsProvider from 'next-auth/providers/credentials'
import jwt from 'jsonwebtoken'

/**
 * SeniorSync Authentication Configuration
 * 
 * Generates secure JWT tokens for API authentication with proper:
 * - Cryptographic signing (HMAC-SHA256)
 * - Expiration handling
 * - Industry standard JWT format
 * - Backward compatibility with legacy format
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
          
          if (userData.staffId && userData.email) {
            return {
              id: userData.staffId.toString(),
              email: userData.email,
              name: `${userData.firstName} ${userData.lastName}`,
              role: userData.roleType,
              jobTitle: userData.jobTitle,
              firstName: userData.firstName,
              lastName: userData.lastName,
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role
        token.jobTitle = user.jobTitle
        token.firstName = user.firstName
        token.lastName = user.lastName
      }
      return token
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.sub as string
        session.user.role = token.role as string
        session.user.jobTitle = token.jobTitle as string
        session.user.firstName = token.firstName as string
        session.user.lastName = token.lastName as string
        
        // 🔐 Generate secure JWT token for API calls
        if (token.sub && token.role) {
          try {
            const jwtSecret = process.env.NEXTAUTH_SECRET
            if (!jwtSecret) {
              console.error('NEXTAUTH_SECRET is not configured')
              // Fallback to legacy format for backward compatibility
              session.accessToken = `nextauth.${token.sub}.${token.role}`
            } else {
              // Generate proper JWT token
              const now = Math.floor(Date.now() / 1000)
              const jwtPayload = {
                sub: token.sub,                              // Subject (User ID)
                role: token.role,                            // User role
                email: session.user.email,                   // User email
                name: session.user.name,                     // Full name
                jobTitle: token.jobTitle,                    // Job title
                iat: now,                                    // Issued at
                exp: now + (24 * 60 * 60),                 // Expires in 24 hours
                iss: 'seniorsync-crm',                      // Issuer
                aud: 'seniorsync-api',                      // Audience
                jti: `${token.sub}-${now}`,                 // JWT ID (unique)
              }
              
              // Sign JWT with HMAC-SHA256
              session.accessToken = jwt.sign(jwtPayload, jwtSecret, {
                algorithm: 'HS256',
                header: {
                  typ: 'JWT',
                  alg: 'HS256'
                }
              })
              
              console.log('Generated secure JWT token for user:', token.sub)
            }
          } catch (error) {
            console.error('JWT generation error:', error)
            // Fallback to legacy format for backward compatibility
            session.accessToken = `nextauth.${token.sub}.${token.role}`
          }
        }
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handler = NextAuth(authOptions) as any

export { handler as GET, handler as POST } 