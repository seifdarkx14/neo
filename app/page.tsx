"use client"

import { useState, useEffect } from "react"
import { ProductSelector } from "@/components/product-selector"
import { useProductContext } from "@/lib/ProductContext"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function Home() {
  const router = useRouter()
  const { selectedProducts, removeProduct } = useProductContext()
  const [isAdmin, setIsAdmin] = useState(false)

  // Check if user is logged in as admin
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check')
        const data = await response.json()
        setIsAdmin(data.isAuthenticated)
      } catch (error) {
        console.error('Auth check failed:', error)
      }
    }
    checkAuth()
  }, [])

  const handleDataEntryClick = () => {
    if (!isAdmin) {
      toast.error("Please log in as admin to access data entry")
      return
    }
    router.push('/admin/data-entry')
  }

  return (
    <main className="flex-grow flex flex-col">
      <div className="container mx-auto p-4 sm:p-8 flex-grow">
        <h1 className="text-3xl font-light text-[#40C4FF] mb-8">Product Code Generator</h1>
        {selectedProducts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-light text-[#40C4FF] mb-4">Selected Products</h2>
            <ul className="space-y-2">
              {selectedProducts.map((product) => (
                <li key={product.id} className="flex items-center justify-between bg-[#2a3744] p-4 rounded-lg">
                  <span className="text-white">
                    {product.name} - {product.code}
                  </span>
                  <Button onClick={() => removeProduct(product.id)} variant="destructive" size="sm">
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <ProductSelector />

        {/* Admin button - only shows when logged in */}
        {isAdmin && (
          <div className="fixed bottom-8 right-8">
            <Button
              onClick={handleDataEntryClick}
              className="bg-[#40C4FF] text-white hover:bg-blue-400"
            >
              <Settings className="mr-2 h-4 w-4" />
              Data Entry
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}

