"use server"

import { kv } from "@vercel/kv"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

type Specification = {
  name: string
  value: string
}

type ProductData = {
  category: string
  type: string
  name: string
  code: string
  description: string
  specifications: Specification[]
}

export async function login(username: string, password: string) {
  if (username === "admin" && password === "neowave342") {
    cookies().set("auth", "true", { httpOnly: true })
    return { success: true }
  }
  return { success: false }
}

export async function logout() {
  const token = cookies().get("auth")?.value
  if (token) {
    await kv.del(`session:${token}`)
  }
  cookies().delete("auth")
  redirect("/admin/login")
}

export async function addProduct(data: ProductData) {
  try {
    const response = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error("Failed to add product")
    }
    return { success: true }
  } catch (error) {
    console.error("Error adding product:", error)
    return { success: false, error: "Failed to add product" }
  }
}

export async function editProduct(id: string, data: ProductData) {
  try {
    const response = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error("Failed to edit product")
    }
    return { success: true }
  } catch (error) {
    console.error("Error editing product:", error)
    return { success: false, error: "Failed to edit product" }
  }
}

export async function deleteProduct(id: string) {
  try {
    const response = await fetch(`/api/products/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      throw new Error("Failed to delete product")
    }
    return { success: true }
  } catch (error) {
    console.error("Error deleting product:", error)
    return { success: false, error: "Failed to delete product" }
  }
}

