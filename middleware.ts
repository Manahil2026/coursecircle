import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/pages(.*)'])
const isAdminRoute = createRouteMatcher(['/pages/admin(.*)'])
const isProfessorRoute = createRouteMatcher(['/pages/professor(.*)'])
const isStudentRoute = createRouteMatcher(['/pages/student(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)){
    await auth.protect()

    if (isAdminRoute(req) && (await auth()).sessionClaims?.metadata?.role !== 'uni_admin') {
      const url = new URL('/', req.url)
      return NextResponse.redirect(url)
    }

    if (isProfessorRoute(req) && (await auth()).sessionClaims?.metadata?.role !== 'prof') {
      const url = new URL('/', req.url)
      return NextResponse.redirect(url)
    }

    if (isStudentRoute(req) && (await auth()).sessionClaims?.metadata?.role !== 'member') {
      const url = new URL('/', req.url)
      return NextResponse.redirect(url)
    }

  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}