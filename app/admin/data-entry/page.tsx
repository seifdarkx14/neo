"use client"

import { useState, useEffect, useCallback } from "react"
import { DataEntryForm } from "@/components/data-entry-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit, Trash2, Search, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { debounce } from "lodash"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { COLORS } from "@/lib/theme"
import { PasswordModal } from "@/components/password-modal"

const ITEMS_PER_PAGE = 10

export default function DataEntryPage() {
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [productToDelete, setProductToDelete] = useState(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setSearchTerm(term)
      setCurrentPage(1) // Reset to first page on search
    }, 300),
    []
  )

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/products")
      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }
      const products = await response.json()
      setProducts(products)
    } catch (error) {
      console.error("Error fetching products:", error)
      toast.error("Failed to fetch products. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (showAdvanced) {
      const timeout = setTimeout(() => {
        setShowAdvanced(false)
        localStorage.removeItem('showAdvanced')
        toast.info('Advanced mode session expired for security')
      }, 30 * 60 * 1000) // 30 minutes

      return () => clearTimeout(timeout)
    }
  }, [showAdvanced])

  const handleEdit = (product: any) => {
    setEditingProduct(product)
    toast.info("Editing product: " + product.name)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to delete product")
      }
      await fetchProducts()
      setProductToDelete(null)
      toast.success("Product deleted successfully.")
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error("Failed to delete product. Please try again.")
    }
  }

  const handleAdvancedClick = () => {
    if (!showAdvanced) {
      setShowPasswordModal(true)
    } else {
      setShowAdvanced(false)
      localStorage.removeItem('showAdvanced')
    }
  }

  const filteredProducts = products.filter(
    (product: any) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <main className="flex-grow">
      <div className="container mx-auto p-4 sm:p-8">
        <div className="flex justify-between items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.push("/")}
            className="text-[#40C4FF] hover:text-blue-400"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Product Generator
          </Button>
          <Button
            variant="outline"
            onClick={handleAdvancedClick}
            className="text-[#40C4FF] border-[#40C4FF]"
          >
            {showAdvanced ? "Hide Advanced" : "Show Advanced"}
          </Button>
        </div>
        
        <PasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          onSuccess={() => setShowAdvanced(true)}
        />

        <h1 className="text-3xl font-light text-[#40C4FF] mb-8">Product Data Entry</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <DataEntryForm 
              onProductAdded={fetchProducts} 
              editingProduct={editingProduct}
              showAdvanced={showAdvanced}
            />
          </div>
          <div>
            <Card className="bg-[#1B2531] border-[#2a3744]">
              <CardHeader>
                <CardTitle className="text-[#40C4FF] text-xl font-normal">
                  Existing Products
                </CardTitle>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search products..."
                    onChange={(e) => debouncedSearch(e.target.value)}
                    className="pl-10 bg-[#2a3744] border-[#3a4754] text-white"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-[#2a3744] animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : paginatedProducts.length === 0 ? (
                  <p className="text-white text-center py-4">No products found.</p>
                ) : (
                  <>
                    <ul className="space-y-4">
                      {paginatedProducts.map((product: any) => (
                        <li key={product.id} className="flex items-center justify-between bg-[#2a3744] p-4 rounded-lg">
                          <div className="flex flex-col">
                            <span className="text-white font-medium">{product.name}</span>
                            <span className="text-sm text-gray-400">{product.code}</span>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleEdit(product)}
                              variant="outline"
                              size="sm"
                              className="text-[#40C4FF] border-[#40C4FF] hover:bg-[#2a3744]"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => setProductToDelete(product)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-[#1B2531] border-[#2a3744]">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-white">
                                    Delete Product
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-gray-400">
                                    Are you sure you want to delete this product? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-[#2a3744] text-white hover:bg-[#3a4754]">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-500 text-white hover:bg-red-600"
                                    onClick={() => handleDelete(product.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </li>
                      ))}
                    </ul>
                    {totalPages > 1 && (
                      <div className="flex justify-center space-x-2 mt-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="text-[#40C4FF] border-[#40C4FF]"
                        >
                          Previous
                        </Button>
                        <span className="text-white py-2">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="text-[#40C4FF] border-[#40C4FF]"
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

