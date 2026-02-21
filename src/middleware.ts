import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    const {
        data: { session },
    } = await supabase.auth.getSession()

    // Protect routes like /puzzles
    if (!session && req.nextUrl.pathname.startsWith('/puzzles')) {
        const url = req.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    return res
}

export const config = {
    matcher: ['/puzzles/:path*', '/login'],
}
