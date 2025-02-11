import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  const cookieStore = cookies()
  const authCookie = cookieStore.get("auth")
  
  return NextResponse.json({
    isAuthenticated: !!authCookie,
  })
} 