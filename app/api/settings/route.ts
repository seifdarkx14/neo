import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"

// Default data
const DEFAULT_CATEGORIES = [
  {
    id: "io-modules",
    name: "I/O modules and data transmission",
    types: [
      { id: "industrial-switches", name: "Industrial switches" },
      { id: "io-modules", name: "I/O modules" },
    ],
  },
  {
    id: "sensors-switches",
    name: "Sensors and Switches",
    types: [
      { id: "temp-humid", name: "Temperature and humidity" },
      { id: "air-quality", name: "Air Quality" },
      { id: "pressure", name: "Pressure (Air & liquid)" },
      { id: "level", name: "Level Measuring" },
    ],
  }
]

const DEFAULT_MODELS = {
  "temp-humid": {
    name: "Temperature & Humidity",
    specifications: {
      accuracy: [
        { value: "±2%RH", code: "2", label: "±2%RH(±0.3℃)" },
        { value: "±3%RH", code: "3", label: "±3%RH(±0.5℃)" },
      ],
      output: [
        { value: "RS485", code: "485", label: "RS485 Modbus" },
        { value: "4-20mA", code: "420", label: "4-20mA" },
      ],
    }
  },
  "air-quality": {
    name: "Air Quality",
    specifications: {
      type: [
        { value: "CO2", code: "CO2", label: "Carbon Dioxide" },
        { value: "VOC", code: "VOC", label: "Volatile Organic Compounds" },
      ],
      range: [
        { value: "0-2000", code: "2K", label: "0-2000 ppm" },
        { value: "0-5000", code: "5K", label: "0-5000 ppm" },
      ]
    }
  },
  "pressure": {
    name: "Pressure Sensors",
    specifications: {
      range: [
        { value: "0-10", code: "10", label: "0-10 bar" },
        { value: "0-16", code: "16", label: "0-16 bar" },
      ],
      output: [
        { value: "4-20mA", code: "420", label: "4-20mA" },
        { value: "0-10V", code: "010", label: "0-10V" },
      ]
    }
  },
  "level": {
    name: "Level Sensors",
    specifications: {
      type: [
        { value: "Ultrasonic", code: "ULT", label: "Ultrasonic" },
        { value: "Float", code: "FLT", label: "Float Switch" },
      ],
      range: [
        { value: "0-5", code: "5M", label: "0-5 meters" },
        { value: "0-10", code: "10M", label: "0-10 meters" },
      ]
    }
  }
}

export async function GET() {
  try {
    let categories = await kv.get("categories")
    let models = await kv.get("models")

    // Only use defaults if no data exists
    if (!categories) {
      categories = DEFAULT_CATEGORIES
      await kv.set("categories", categories)
    }
    
    if (!models) {
      models = DEFAULT_MODELS
      await kv.set("models", models)
    }

    console.log("Fetched data:", { categories, models })
    return NextResponse.json({ categories, models })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ 
      error: "Failed to fetch settings",
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log("Received update:", data)

    // Get current data first
    let currentCategories = await kv.get("categories") || []
    let currentModels = await kv.get("models") || {}

    // Update only what was sent
    if (data.categories) {
      currentCategories = data.categories
      await kv.set("categories", currentCategories)
    }
    
    if (data.models) {
      currentModels = data.models
      await kv.set("models", currentModels)
    }

    return NextResponse.json({ 
      success: true,
      categories: currentCategories,
      models: currentModels
    })
  } catch (error) {
    console.error("Error saving settings:", error)
    return NextResponse.json({ 
      error: "Failed to save settings",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 