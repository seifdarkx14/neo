"use client"

import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

const productCategories = [
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
      { id: "flow", name: "Flow sensors (Air & liquid)" },
    ],
  },
  {
    id: "hvac-control",
    name: "HVAC control",
    types: [
      { id: "smart-thermostat", name: "Smart Thermostat" },
      { id: "damper-actuators", name: "Damper Actuators" },
    ],
  },
  {
    id: "power-energy",
    name: "Power & Energy",
    types: [
      { id: "btu-meters", name: "BTU Meters" },
      { id: "water-meters", name: "Water Meters" },
    ],
  },
  {
    id: "life-safety",
    name: "Life Safety Systems",
    types: [
      { id: "fire-alarm", name: "Fire Alarm Systems" },
      { id: "gas-detectors", name: "LPG & Natural Gas Detectors" },
    ],
  },
]

interface ProductCategorySelectorProps {
  onCategorySelect: (categoryId: string) => void
}

export function ProductCategorySelector({ onCategorySelect }: ProductCategorySelectorProps) {
  return (
    <div className="grid gap-4">
      {productCategories.map((category) => (
        <Button
          key={category.id}
          variant="outline"
          className="w-full justify-between text-[#40C4FF] border-[#40C4FF] hover:bg-[#2a3744]"
          onClick={() => onCategorySelect(category.id)}
        >
          {category.name}
          <ChevronRight className="h-4 w-4" />
        </Button>
      ))}
    </div>
  )
}

