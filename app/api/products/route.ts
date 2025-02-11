import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function GET() {
  try {
    const productKeys = await kv.keys("product:*")
    const products = await Promise.all(
      productKeys.map(async (key) => {
        const product = await kv.hgetall(key)
        return product
      })
    )
    return NextResponse.json(products.filter(Boolean))
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Failed to fetch products" }, 
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const data = JSON.parse(formData.get("data") as string)
    const photo = formData.get("photo") as File | null

    console.log("Received data:", data)
    console.log("KV URL:", process.env.KV_URL) // Debug KV connection
    
    if (!process.env.KV_URL) {
      throw new Error("KV_URL environment variable is not set")
    }

    // Generate a unique ID for the product
    const id = `${data.code.toLowerCase().replace(/[^a-z0-9]/g, "")}-${Date.now()}`

    let photoUrl = ""
    if (photo) {
      try {
        const bytes = await photo.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        // Ensure uploads directory exists
        const uploadsDir = path.join(process.cwd(), "public", "uploads")
        await mkdir(uploadsDir, { recursive: true })
        
        const photoName = `${id}-${Date.now()}${path.extname(photo.name)}`
        const photoPath = path.join(uploadsDir, photoName)
        await writeFile(photoPath, buffer)
        photoUrl = `/uploads/${photoName}`
      } catch (error) {
        console.error("Error saving photo:", error)
      }
    }

    // Prepare product data
    const productData = {
      id,
      ...data,
      photoUrl,
      createdAt: new Date().toISOString(),
    }

    console.log("Attempting to save product:", productData)

    try {
      // Save to KV store
      await kv.hset(`product:${id}`, productData)
      console.log("Product saved successfully")
    } catch (kvError) {
      console.error("KV store error:", kvError)
      throw new Error(`KV store error: ${kvError instanceof Error ? kvError.message : 'Unknown KV error'}`)
    }

    return NextResponse.json({ 
      success: true, 
      id,
      message: "Product created successfully" 
    })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to create product",
        details: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    )
  }
}

