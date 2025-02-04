export {}

// Create a type for the roles
export type Roles = 'uni_admin' | 'prof' | 'member'

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles
    }
  }
}