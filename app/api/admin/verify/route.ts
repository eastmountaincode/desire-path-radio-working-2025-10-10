import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    
    const adminPassword = process.env.ADMIN_PASSWORD
    
    if (!adminPassword) {
      return NextResponse.json(
        { error: 'Admin password not configured' },
        { status: 500 }
      )
    }
    
    if (password === adminPassword) {
      // Set a cookie to remember authentication
      const cookieStore = await cookies()
      cookieStore.set('admin_authenticated', 'true', {
        httpOnly: true, //javascript cannot read or modify the cookie
        secure: process.env.NODE_ENV === 'production', // only send cookie over https in production
        sameSite: 'lax', // Changed from 'strict' to 'lax' to allow cookies to work on Vercel preview deployments
        path: '/', // Explicitly set path to ensure cookie is available across all routes
        maxAge: 60 * 60 * 1 // 1 hour
      })
      
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }
  } catch {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}

