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
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    jobTitle?: string
    firstName?: string
    lastName?: string
  }
} 