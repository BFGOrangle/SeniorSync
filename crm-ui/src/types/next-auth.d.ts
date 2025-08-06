// NextAuth.js type declarations
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      jobTitle: string
      firstName: string
      lastName: string
      centerId?: string
      centerName?: string
    }
    accessToken?: string
  }

  interface User {
    id: string
    email: string
    name: string
    role: string
    jobTitle: string
    firstName: string
    lastName: string
    centerId?: string
    centerName?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    jobTitle?: string
    firstName?: string
    lastName?: string
    centerId?: string
    centerName?: string
  }
} 