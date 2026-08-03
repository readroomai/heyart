import { NextResponse, type NextRequest } from 'next/server'
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { isClerkConfigured, isPreviewAuthEnabled } from '@/lib/env'

const isProtectedRoute = createRouteMatcher(['/app(.*)'])

const clerkHandler = clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    if (isPreviewAuthEnabled()) return
    await auth.protect()
  }
})

/**
 * Clerk guards /app. When Clerk is not configured the protected routes send
 * visitors to the setup notice instead of failing with an opaque error.
 */
export default function middleware(request: NextRequest, event: never) {
  if (!isClerkConfigured()) {
    if (isProtectedRoute(request) && !isPreviewAuthEnabled()) {
      return NextResponse.redirect(new URL('/setup', request.url))
    }
    return NextResponse.next()
  }
  return clerkHandler(request, event)
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)', '/(api|trpc)(.*)'],
}
