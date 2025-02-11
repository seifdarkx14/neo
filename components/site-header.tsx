"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { HeaderSearch } from "./header-search"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X } from "lucide-react"
import { logout } from "@/app/actions"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const response = await fetch("/api/check-auth")
      const { authenticated } = await response.json()
      setIsAuthenticated(authenticated)
    }
    checkAuth()

    // Add scroll listener
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    await logout()
    setIsAuthenticated(false)
    router.push("/")
  }

  const handleLogin = () => {
    router.push("/login")
  }

  const navigationLinks = [
    { href: "https://neowave.tech/", label: "HOME", current: true },
    { href: "https://neowave.tech/products/", label: "PRODUCTS", hasDropdown: true },
    { href: "https://neowave.tech/career/", label: "CAREER" },
    { href: "https://neowave.tech/news-and-event/", label: "NEWS AND EVENT" },
    { href: "https://neowave.tech/contact-us/", label: "CONTACT US" },
  ]

  return (
    <header
      className={cn(
        "site-header w-full bg-[#1B2531] border-b border-[#2a3744] sticky top-0 z-50 transition-shadow duration-200",
        isScrolled && "shadow-lg",
      )}
    >
      <div className="header-inner container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="site-branding">
          <a href="https://neowave.tech/" className="custom-logo-link">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-for-header-2-300x75-new-April-2024-sbw0Apd0FWeuoojavqgVb5z3mA1XnP.png"
              alt="Neo Wave"
              width={180}
              height={45}
              className="h-auto w-auto"
              priority
            />
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className="site-navigation hidden lg:flex items-center">
          <ul className="menu flex items-center gap-8 text-sm">
            {navigationLinks.map((link) => (
              <li key={link.label} className={link.hasDropdown ? "menu-item-has-children relative group" : undefined}>
                <a
                  href={link.href}
                  className={cn(
                    "transition-colors hover:text-[#40C4FF] flex items-center gap-1",
                    link.current ? "text-[#40C4FF]" : "text-white",
                  )}
                >
                  {link.label}
                  {link.hasDropdown && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-transform group-hover:rotate-180"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  )}
                </a>
                {link.hasDropdown && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full hidden group-hover:grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 w-[calc(100vw-2rem)] max-w-[1200px] p-6 bg-[#1B2531] border border-[#2a3744] rounded-lg shadow-xl">
                    <div>
                      <h3 className="text-[#40C4FF] font-medium mb-4">I/O modules and data transmission</h3>
                      <ul className="space-y-2">
                        <li>
                          <a
                            href="https://neowave.tech/p-catigory/industrial-switches"
                            className="text-white hover:text-[#40C4FF] transition-colors block"
                          >
                            Industrial switches
                          </a>
                        </li>
                        <li>
                          <a
                            href="https://neowave.tech/p-catigory/i-o-modules"
                            className="text-white hover:text-[#40C4FF] transition-colors block"
                          >
                            I/O modules
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-[#40C4FF] font-medium mb-4">Sensors and Switches</h3>
                      <ul className="space-y-2">
                        <li>
                          <a
                            href="https://neowave.tech/p-catigory/temperature-and-humidity"
                            className="text-white hover:text-[#40C4FF] transition-colors block"
                          >
                            Temperature and humidity
                          </a>
                        </li>
                        <li>
                          <a
                            href="https://neowave.tech/p-catigory/air-quality"
                            className="text-white hover:text-[#40C4FF] transition-colors block"
                          >
                            Air Quality
                          </a>
                        </li>
                        <li>
                          <a
                            href="https://neowave.tech/p-catigory/pressure-air-liquid"
                            className="text-white hover:text-[#40C4FF] transition-colors block"
                          >
                            Pressure (Air & liquid)
                          </a>
                        </li>
                        <li>
                          <a
                            href="https://neowave.tech/p-catigory/level-measuring"
                            className="text-white hover:text-[#40C4FF] transition-colors block"
                          >
                            Level Measuring
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-[#40C4FF] font-medium mb-4">HVAC control</h3>
                      <ul className="space-y-2">
                        <li>
                          <a
                            href="https://neowave.tech/p-catigory/smart-thermostat"
                            className="text-white hover:text-[#40C4FF] transition-colors block"
                          >
                            Smart Thermostat
                          </a>
                        </li>
                        <li>
                          <a
                            href="https://neowave.tech/p-catigory/damper-actuators"
                            className="text-white hover:text-[#40C4FF] transition-colors block"
                          >
                            Damper Actuators
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-[#40C4FF] font-medium mb-4">Power & Energy</h3>
                      <ul className="space-y-2">
                        <li>
                          <a
                            href="https://neowave.tech/p-catigory/btu-meters"
                            className="text-white hover:text-[#40C4FF] transition-colors block"
                          >
                            BTU Meters
                          </a>
                        </li>
                        <li>
                          <a
                            href="https://neowave.tech/p-catigory/water-meters"
                            className="text-white hover:text-[#40C4FF] transition-colors block"
                          >
                            Water Meters
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-[#40C4FF] font-medium mb-4">Life Safety Systems</h3>
                      <ul className="space-y-2">
                        <li>
                          <a
                            href="https://neowave.tech/p-catigory/fire-alarm-systems"
                            className="text-white hover:text-[#40C4FF] transition-colors block"
                          >
                            Fire Alarm Systems
                          </a>
                        </li>
                        <li>
                          <a
                            href="https://neowave.tech/p-catigory/lpg-natural-gas-detectors"
                            className="text-white hover:text-[#40C4FF] transition-colors block"
                          >
                            LPG & Natural Gas Detectors
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </li>
            ))}
            <li>
              <Button
                onClick={isAuthenticated ? handleLogout : handleLogin}
                variant="outline"
                className="text-[#40C4FF] border-[#40C4FF] hover:bg-[#2a3744] transition-colors"
              >
                {isAuthenticated ? "Logout" : "Login"}
              </Button>
            </li>
          </ul>
          <div className="ml-8">
            <HeaderSearch />
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className="lg:hidden flex items-center gap-4">
          <HeaderSearch />
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:text-[#40C4FF]">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-[#1B2531] border-[#2a3744] p-0">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-[#2a3744] flex justify-between items-center">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-for-header-2-300x75-new-April-2024-sbw0Apd0FWeuoojavqgVb5z3mA1XnP.png"
                    alt="Neo Wave"
                    width={120}
                    height={30}
                    className="h-auto w-auto"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-white hover:text-[#40C4FF]"
                  >
                    <X className="h-6 w-6" />
                    <span className="sr-only">Close menu</span>
                  </Button>
                </div>
                <nav className="flex-1 overflow-y-auto">
                  <ul className="p-4 space-y-4">
                    {navigationLinks.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className={cn(
                            "block py-2 transition-colors hover:text-[#40C4FF]",
                            link.current ? "text-[#40C4FF]" : "text-white",
                          )}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
                <div className="p-4 border-t border-[#2a3744]">
                  <Button
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      isAuthenticated ? handleLogout() : handleLogin()
                    }}
                    className="w-full bg-[#40C4FF] text-white hover:bg-blue-400"
                  >
                    {isAuthenticated ? "Logout" : "Login"}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

