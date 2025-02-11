"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { login } from "@/app/actions"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { COLORS } from "@/lib/theme"

const MAX_ATTEMPTS = 5
const MIN_PASSWORD_LENGTH = 6

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()

  const validateForm = useCallback(() => {
    if (!username.trim()) {
      setError("Username is required")
      return false
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
      return false
    }
    return true
  }, [username, password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (attempts >= MAX_ATTEMPTS) {
      toast.error("Too many attempts. Please try again later.")
      return
    }

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      const result = await login(username, password)
      if (result.success) {
        toast.success("Login successful!")
        if (rememberMe) {
          // Store remember me preference
          localStorage.setItem("rememberMe", username)
        }
        router.push("/admin/data-entry")
      } else {
        setAttempts(prev => prev + 1)
        setError("Invalid credentials")
        toast.error("Login failed. Please check your credentials.")
      }
    } catch (error) {
      console.error("Login error:", error)
      toast.error("An error occurred. Please try again.")
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex-grow flex flex-col items-center justify-center min-h-screen">
      <div className="container mx-auto p-4 sm:p-8 w-full max-w-md">
        <Button 
          variant="ghost" 
          onClick={() => router.push("/")}
          className="mb-6 text-[#40C4FF] hover:text-blue-400"
          aria-label="Return to Product Generator"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Product Generator
        </Button>
        <Card className="w-full bg-[#1B2531] border-[#2a3744] shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#40C4FF] text-2xl font-normal">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-[#2a3744] border-[#3a4754] text-white"
                  aria-label="Username"
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-[#2a3744] border-[#3a4754] text-white"
                  aria-label="Password"
                  autoComplete="current-password"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe} 
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  disabled={isLoading}
                  className="text-[#40C4FF]"
                />
                <Label htmlFor="remember" className="text-white cursor-pointer">
                  Remember me
                </Label>
              </div>
              {error && (
                <p className="text-red-500 text-sm" role="alert">
                  {error}
                </p>
              )}
              <Button 
                type="submit" 
                className="w-full bg-[#40C4FF] text-white hover:bg-blue-400"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
              {attempts > 0 && (
                <p className="text-sm text-gray-400 text-center">
                  Attempts remaining: {MAX_ATTEMPTS - attempts}
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

