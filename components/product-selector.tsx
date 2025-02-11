"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check, Thermometer, Wind, Gauge, Ruler, Download } from "lucide-react"
import { sensorTypes, modelSpecifications, sensorModels } from "@/lib/data"
import { toast } from "sonner"
// import { ComparisonView } from "./comparison-view"
import { ProductCodeFormat } from "./product-code-format"
import Image from "next/image"
import { ProductCategorySelector } from "./product-category-selector"
import { SelectionProgress } from "./selection-progress"
import { FilterOption } from "./filter-option"
// import { ProductDetails } from "./product-details"

const STEPS = ["category", "type", "filter", "model", "specs"]

const modelCharacteristics = {
  // Existing temperature and humidity models
  TxTH52: { outdoor: true, tempHumidity: true },
  TxTH28N: { duct: true, tempHumidity: true },
  "TxTH91-XP": { indoor: true, tempHumidity: true },
  TxSL22: { water: true, tempOnly: true, level: true },
  TxTH1P: { duct: true, tempHumidity: true },
  TxT02: { duct: true, tempOnly: true },
  TxTH28: { indoor: true, tempHumidity: true },
  TxTH25: { indoor: true, tempHumidity: true },

  // Add air quality sensor models
  TxCOW31: { outdoor: true, co: true, wallMounted: true },
  TxCOI32: { indoor: true, co: true },
  TxCDW33: { outdoor: true, co2: true, wallMounted: true },
  TxCDD34: { indoor: true, co2: true, ductMounted: true },
  TxCDI35: { indoor: true, co2: true },
  TxAQ37: { indoor: true, voc: true, co2: true },
  TxCDT380: { indoor: true, outdoor: true, co2: true, wallMounted: true, ductMounted: true },

  // Pressure sensors
  TXADP12: { sensors: true, air: true },
  DPS52: { switches: true, liquid: true, air: true },
  DPS18: { switches: true, air: true },
  TxDP35: { sensors: true, air: true },
  TxLDP16: { sensors: true, air: true },
}

export function ProductSelector() {
  const [step, setStep] = useState<"category" | "type" | "filter" | "model" | "specs">("category")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const [model, setModel] = useState("")
  const [copied, setCopied] = useState(false)
  const [specs, setSpecs] = useState<Record<string, string>>({})
  const [filters, setFilters] = useState({
    duct: false,
    water: false,
    outdoor: false,
    indoor: false,
    tempHumidity: false,
    tempOnly: false,
    co: false,
    co2: false,
    voc: false,
    wallMounted: false,
    ductMounted: false,
    switches: false,
    sensors: false,
    liquid: false,
    air: false,
  })
  const [description, setDescription] = useState("")
  const [productCode, setProductCode] = useState("")
  const [customProducts, setCustomProducts] = useState<any[]>([])

  useEffect(() => {
    const fetchCustomProducts = async () => {
      try {
        const response = await fetch("/api/products")
        if (!response.ok) {
          throw new Error("Failed to fetch custom products")
        }
        const data = await response.json()
        setCustomProducts(data)
      } catch (error) {
        console.error("Error fetching custom products:", error)
      }
    }

    fetchCustomProducts()
  }, [])

  const selectedSensorType = sensorTypes.find((type) => type.id === selectedType)
  const selectedModel = model ? modelSpecifications[model as keyof typeof modelSpecifications] : null

  const getSensorIcon = (type: string) => {
    switch (type) {
      case "temp-humid":
        return <Thermometer className="h-5 w-5" />
      case "air-quality":
        return <Wind className="h-5 w-5" />
      case "pressure":
        return <Gauge className="h-5 w-5" />
      case "level":
        return <Ruler className="h-5 w-5" />
      case "flow":
        return <Download className="h-5 w-5" />
      default:
        return null
    }
  }

  const getRequiredSpecs = () => {
    if (!selectedType || !model) return []

    const customProduct = customProducts.find((product) => product.code.split("-")[0] === model.split("-")[0])
    if (customProduct) {
      console.log("Found custom product specs:", customProduct.specifications)
      return customProduct.specifications.map((spec: any) => spec.name)
    }

    if (!selectedModel) return []
    return Object.keys(selectedModel.availableOptions)
  }

  const getSpecOptions = (specType: string) => {
    if (!selectedType || !model) return []

    const customProduct = customProducts.find((product) => product.code.split("-")[0] === model.split("-")[0])
    if (customProduct) {
      console.log("Getting spec options for:", specType)
      const spec = customProduct.specifications.find((s: any) => s.name === specType)
      if (spec) {
        console.log("Found specification:", spec)
        return spec.options
      }
      return []
    }

    const availableOptions = selectedModel.availableOptions[specType]
    if (!availableOptions) return []

    try {
      // If availableOptions is a string, it refers to a measureRange type
      if (typeof availableOptions === "string") {
        const rangeType = availableOptions
        return selectedSensorType?.specifications.measureRange?.[rangeType] || []
      }

      // If availableOptions is an array of strings, map them to the specifications
      if (Array.isArray(availableOptions) && typeof availableOptions[0] === "string") {
        const specOptions = selectedSensorType?.specifications[specType]
        if (!Array.isArray(specOptions)) return []
        return specOptions.filter((opt) => availableOptions.includes(opt.value))
      }

      // If availableOptions is already an array of objects with value and label
      if (Array.isArray(availableOptions) && typeof availableOptions[0] === "object") {
        return availableOptions
      }

      return []
    } catch (error) {
      console.error("Error getting spec options:", error)
      return []
    }
  }

  const generateProductCode = (currentSpecs: Record<string, string>) => {
    if (!selectedType || !model) return ""

    const customProduct = customProducts.find((product) => product.code.split("-")[0] === model.split("-")[0])
    if (customProduct) {
      console.log("Generating code for custom product:", customProduct)
      console.log("Current specs:", currentSpecs)

      const allSpecsSelected = customProduct.specifications.every((spec: any) => currentSpecs[spec.name])
      if (!allSpecsSelected) return ""

      const specCodes = customProduct.specifications.map((spec: any) => {
        const selectedOption = spec.options.find((opt: any) => opt.value === currentSpecs[spec.name])
        return selectedOption?.code || ""
      })

      const baseCode = customProduct.code.split("-")[0]
      const newCode = `${baseCode}-${specCodes.join("-")}`
      console.log("Generated code:", newCode)
      return newCode
    }

    const modelSpec = modelSpecifications[model as keyof typeof modelSpecifications]
    if (!modelSpec) return ""

    // Check if all required specifications are selected
    const requiredSpecs = getRequiredSpecs()
    const hasAllRequiredSpecs = requiredSpecs.every((spec) => currentSpecs[spec])
    if (!hasAllRequiredSpecs) return ""

    try {
      return modelSpec.generateCode(currentSpecs)
    } catch (error) {
      console.error("Error generating product code:", error)
      return ""
    }
  }

  const handleSpecChange = (specType: string, value: string) => {
    console.log("Changing spec for custom product:", specType, "to value:", value)
    setSpecs((prev) => {
      const newSpecs = { ...prev, [specType]: value }
      console.log("New specs state for custom product:", newSpecs)
      const newCode = generateProductCode(newSpecs)
      setProductCode(newCode)
      setDescription(getDetailedDescription())
      return newSpecs
    })
  }

  const resetSelections = () => {
    setStep("category")
    setSelectedCategory("")
    setSelectedType("")
    setModel("")
    setSpecs({})
    setFilters({
      duct: false,
      water: false,
      outdoor: false,
      indoor: false,
      tempHumidity: false,
      tempOnly: false,
      co: false,
      co2: false,
      voc: false,
      wallMounted: false,
      ductMounted: false,
      switches: false,
      sensors: false,
      liquid: false,
      air: false,
    })
    setProductCode("")
    setDescription("")
    // setComparisonList([])
  }

  const copyToClipboard = async () => {
    if (productCode) {
      await navigator.clipboard.writeText(productCode)
      setCopied(true)
      toast.success("Product code copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const copyDescription = async () => {
    if (description) {
      await navigator.clipboard.writeText(description)
      toast.success("Product description copied to clipboard!")
    }
  }

  // const addToComparison = () => {
  //   const productCode = generateProductCode()
  //   if (productCode && !comparisonList.includes(productCode)) {
  //     setComparisonList((prev) => [...prev, productCode])
  //     toast.success("Product added to comparison")
  //   } else if (comparisonList.includes(productCode)) {
  //     toast.error("This product is already in the comparison list")
  //   }
  // }

  // const removeFromComparison = (productCode: string) => {
  //   setComparisonList((prev) => prev.filter((code) => code !== productCode))
  // }

  const getFilteredModels = (sensorType: any) => {
    if (!sensorType?.specifications?.model) return []

    const activeFilters = Object.entries(filters)
      .filter(([_, value]) => value)
      .map(([key]) => key)

    const availableModels = [...sensorType.specifications.model]

    // Add custom products to available models
    customProducts.forEach((product) => {
      if (product.type === selectedType) {
        availableModels.push({
          value: product.code,
          label: product.name, // Remove the " (Custom)" suffix
        })
      }
    })

    // If no filters are active, return all models for the current sensor type
    if (activeFilters.length === 0) return availableModels

    return availableModels.filter((modelOption: any) => {
      const modelInfo = modelCharacteristics[modelOption.value as keyof typeof modelCharacteristics]
      if (!modelInfo) {
        // Check if it's a custom product
        const customProduct = customProducts.find((p) => p.code === modelOption.value)
        if (customProduct) {
          // Implement custom product filtering logic here if needed
          return true
        }
        console.log(`No model info for ${modelOption.value}`)
        return false
      }

      console.log(`Checking model ${modelOption.value}:`, modelInfo)
      return activeFilters.every((filter) => {
        const matches = !!modelInfo[filter as keyof typeof modelInfo]
        console.log(`- Filter ${filter}:`, matches)
        return matches
      })
    })
  }

  const getProductDescription = () => {
    if (!selectedType || !model) return ""
    const modelSpec = modelSpecifications[model as keyof typeof modelSpecifications]
    return modelSpec?.description || ""
  }

  const getDetailedDescription = () => {
    if (!selectedType || !model || !specs) return ""

    const customProduct = customProducts.find((product) => product.code.split("-")[0] === model.split("-")[0])
    if (customProduct) {
      const specDescriptions = customProduct.specifications
        .map((spec: any) => {
          const selectedOption = spec.options.find((opt: any) => opt.value === specs[spec.name])
          return selectedOption
            ? `${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)}: ${selectedOption.label}`
            : `${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)}: Not selected`
        })
        .filter((desc) => desc)
        .join(" | ")

      return customProduct.description || `${customProduct.name} - ${specDescriptions}`
    }

    // Rest of the function remains the same for non-custom products
    const modelName = sensorModels[selectedType]?.find((m) => m.id === model)?.name || ""
    const specDescriptions = Object.entries(specs)
      .map(([key, value]) => {
        const specOptions = getSpecOptions(key)
        const specLabel = specOptions.find((opt) => opt.value === value)?.label || value
        return `${key.replace(/([A-Z])/g, " $1").toLowerCase()}: ${specLabel}`
      })
      .join(" | ")

    return `${modelName} with ${specDescriptions}`
  }

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setStep("type")
  }

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId)
    setStep("filter")
  }

  const handleFilterApply = () => {
    setStep("model")
  }

  const handleModelSelect = (modelId: string) => {
    setModel(modelId)
    setProductCode("")
    setDescription("")

    const customProduct = customProducts.find((product) => product.code.split("-")[0] === modelId.split("-")[0])
    if (customProduct) {
      console.log("Selected custom product:", customProduct)

      // Initialize specs with empty values for all specifications
      const initialSpecs = customProduct.specifications.reduce((acc: Record<string, string>, spec: any) => {
        acc[spec.name] = ""
        return acc
      }, {})

      setSpecs(initialSpecs)
      console.log("Initialized specs:", initialSpecs)
    } else {
      setSpecs({})
    }
    setStep("specs")
  }

  const handleDatasheetDownload = () => {
    // This is a placeholder. Replace with actual datasheet URL when available.
    const datasheetUrl = `https://example.com/datasheets/${model}.pdf`
    window.open(datasheetUrl, "_blank")
  }

  return (
    <>
      <Card className="bg-[#1B2531] border-[#2a3744]" role="region" aria-label="Product Selector">
        <CardHeader className="flex flex-row items-center justify-between" aria-label="Product Selector Header">
          <CardTitle className="text-[#40C4FF] text-xl font-normal">Product Selector</CardTitle>
          <Button
            onClick={resetSelections}
            variant="outline"
            className="text-[#40C4FF] border-[#40C4FF] hover:bg-[#2a3744]"
          >
            Reset
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <SelectionProgress steps={STEPS} currentStep={step} />
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-200">
              {step === "category" && "Select Product Category"}
              {step === "type" && "Select Sensor Type"}
              {step === "filter" && "Filter Options"}
              {step === "model" && "Select Model"}
              {step === "specs" && "Select Specifications"}
            </h3>
            {step !== "category" && (
              <Button
                onClick={() => {
                  setStep(STEPS[STEPS.indexOf(step) - 1])
                  setProductCode("")
                  setDescription("")
                }}
                variant="outline"
                className="text-[#40C4FF] border-[#40C4FF] hover:bg-[#2a3744]"
              >
                Back
              </Button>
            )}
          </div>
          <div className="transition-all duration-300 ease-in-out">
            {step === "category" && (
              <div className="animate-fadeIn">
                <ProductCategorySelector onCategorySelect={handleCategorySelect} />
              </div>
            )}

            {step === "type" && (
              <div className="animate-fadeIn">
                <div className="grid grid-cols-2 gap-4">
                  {selectedCategory === "sensors-switches" && (
                    <>
                      <Button
                        onClick={() => handleTypeSelect("temp-humid")}
                        variant="outline"
                        className="justify-start text-left text-gray-200 transition-all duration-200 hover:scale-105"
                      >
                        <span className="mr-2">{getSensorIcon("temp-humid")}</span>
                        Temperature and Humidity
                      </Button>
                      <Button
                        onClick={() => handleTypeSelect("air-quality")}
                        variant="outline"
                        className="justify-start text-left text-gray-200 transition-all duration-200 hover:scale-105"
                      >
                        <span className="mr-2">{getSensorIcon("air-quality")}</span>
                        Air Quality
                      </Button>
                      <Button
                        onClick={() => handleTypeSelect("pressure")}
                        variant="outline"
                        className="justify-start text-left text-gray-200 transition-all duration-200 hover:scale-105"
                      >
                        <span className="mr-2">{getSensorIcon("pressure")}</span>
                        Pressure (Air & Liquid)
                      </Button>
                      <Button
                        onClick={() => handleTypeSelect("level")}
                        variant="outline"
                        className="justify-start text-left text-gray-200 transition-all duration-200 hover:scale-105"
                      >
                        <span className="mr-2">{getSensorIcon("level")}</span>
                        Level Measuring
                      </Button>
                      <Button
                        onClick={() => handleTypeSelect("flow")}
                        variant="outline"
                        className="justify-start text-left text-gray-200 transition-all duration-200 hover:scale-105"
                      >
                        <span className="mr-2">{getSensorIcon("flow")}</span>
                        Flow sensors (Air & liquid)
                      </Button>
                    </>
                  )}

                  {selectedCategory === "io-modules" && (
                    <>
                      <Button
                        onClick={() => handleTypeSelect("industrial-switches")}
                        variant="outline"
                        className="justify-start text-left text-gray-200 transition-all duration-200 hover:scale-105"
                      >
                        Industrial switches
                      </Button>
                      <Button
                        onClick={() => handleTypeSelect("io-modules")}
                        variant="outline"
                        className="justify-start text-left text-gray-200 transition-all duration-200 hover:scale-105"
                      >
                        I/O modules
                      </Button>
                    </>
                  )}

                  {selectedCategory === "hvac-control" && (
                    <>
                      <Button
                        onClick={() => handleTypeSelect("smart-thermostat")}
                        variant="outline"
                        className="justify-start text-left text-gray-200 transition-all duration-200 hover:scale-105"
                      >
                        Smart Thermostat
                      </Button>
                      <Button
                        onClick={() => handleTypeSelect("damper-actuators")}
                        variant="outline"
                        className="justify-start text-left text-gray-200 transition-all duration-200 hover:scale-105"
                      >
                        Damper Actuators
                      </Button>
                    </>
                  )}

                  {selectedCategory === "power-energy" && (
                    <>
                      <Button
                        onClick={() => handleTypeSelect("btu-meters")}
                        variant="outline"
                        className="justify-start text-left text-gray-200 transition-all duration-200 hover:scale-105"
                      >
                        BTU Meters
                      </Button>
                      <Button
                        onClick={() => handleTypeSelect("water-meters")}
                        variant="outline"
                        className="justify-start text-left text-gray-200 transition-all duration-200 hover:scale-105"
                      >
                        Water Meters
                      </Button>
                    </>
                  )}

                  {selectedCategory === "life-safety" && (
                    <>
                      <Button
                        onClick={() => handleTypeSelect("fire-alarm")}
                        variant="outline"
                        className="justify-start text-left text-gray-200 transition-all duration-200 hover:scale-105"
                      >
                        Fire Alarm Systems
                      </Button>
                      <Button
                        onClick={() => handleTypeSelect("gas-detectors")}
                        variant="outline"
                        className="justify-start text-left text-gray-200 transition-all duration-200 hover:scale-105"
                      >
                        LPG & Natural Gas Detectors
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

            {step === "filter" && (
              <div className="animate-fadeIn">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-200">
                    {["level", "flow"].includes(selectedType) ? "No filters available" : "Filter Options"}
                  </h3>
                  {!["level", "flow"].includes(selectedType) && (
                    <div className="flex flex-wrap gap-2">
                      {selectedType === "temp-humid" && (
                        <>
                          <FilterOption
                            label="Duct"
                            isActive={filters.duct}
                            onClick={() => setFilters((prev) => ({ ...prev, duct: !prev.duct }))}
                            tooltip="Sensors designed for duct installation"
                          />
                          <FilterOption
                            label="Water"
                            isActive={filters.water}
                            onClick={() => setFilters((prev) => ({ ...prev, water: !prev.water }))}
                            tooltip="Sensors for water-related measurements"
                          />
                          <FilterOption
                            label="Outdoor"
                            isActive={filters.outdoor}
                            onClick={() => setFilters((prev) => ({ ...prev, outdoor: !prev.outdoor }))}
                            tooltip="Sensors suitable for outdoor use"
                          />
                          <FilterOption
                            label="Indoor"
                            isActive={filters.indoor}
                            onClick={() => setFilters((prev) => ({ ...prev, indoor: !prev.indoor }))}
                            tooltip="Sensors designed for indoor environments"
                          />
                          <FilterOption
                            label="Temperature & Humidity"
                            isActive={filters.tempHumidity}
                            onClick={() => setFilters((prev) => ({ ...prev, tempHumidity: !prev.tempHumidity }))}
                            tooltip="Sensors that measure both temperature and humidity"
                          />
                          <FilterOption
                            label="Temperature Only"
                            isActive={filters.tempOnly}
                            onClick={() => setFilters((prev) => ({ ...prev, tempOnly: !prev.tempOnly }))}
                            tooltip="Sensors that measure temperature only"
                          />
                        </>
                      )}
                      {selectedType === "air-quality" && (
                        <>
                          <FilterOption
                            label="Indoor"
                            isActive={filters.indoor}
                            onClick={() => setFilters((prev) => ({ ...prev, indoor: !prev.indoor }))}
                            tooltip="Indoor air quality sensors"
                          />
                          <FilterOption
                            label="Outdoor"
                            isActive={filters.outdoor}
                            onClick={() => setFilters((prev) => ({ ...prev, outdoor: !prev.outdoor }))}
                            tooltip="Outdoor air quality sensors"
                          />
                          <FilterOption
                            label="VOC"
                            isActive={filters.voc}
                            onClick={() => setFilters((prev) => ({ ...prev, voc: !prev.voc }))}
                            tooltip="Volatile Organic Compounds detection"
                          />
                          <FilterOption
                            label="CO"
                            isActive={filters.co}
                            onClick={() => setFilters((prev) => ({ ...prev, co: !prev.co }))}
                            tooltip="Carbon Monoxide detection"
                          />
                          <FilterOption
                            label="CO₂"
                            isActive={filters.co2}
                            onClick={() => setFilters((prev) => ({ ...prev, co2: !prev.co2 }))}
                            tooltip="Carbon Dioxide detection"
                          />
                          <FilterOption
                            label="Wall Mounted"
                            isActive={filters.wallMounted}
                            onClick={() => setFilters((prev) => ({ ...prev, wallMounted: !prev.wallMounted }))}
                            tooltip="Wall mounted sensors"
                          />
                          <FilterOption
                            label="Duct Mounted"
                            isActive={filters.ductMounted}
                            onClick={() => setFilters((prev) => ({ ...prev, ductMounted: !prev.ductMounted }))}
                            tooltip="Duct mounted sensors"
                          />
                        </>
                      )}
                      {selectedType === "pressure" && (
                        <>
                          <FilterOption
                            label="Switches"
                            isActive={filters.switches}
                            onClick={() => setFilters((prev) => ({ ...prev, switches: !prev.switches }))}
                            tooltip="Pressure switches functionality"
                          />
                          <FilterOption
                            label="Sensors"
                            isActive={filters.sensors}
                            onClick={() => setFilters((prev) => ({ ...prev, sensors: !prev.sensors }))}
                            tooltip="Pressure sensor functionality"
                          />
                          <FilterOption
                            label="Liquid"
                            isActive={filters.liquid}
                            onClick={() => setFilters((prev) => ({ ...prev, liquid: !prev.liquid }))}
                            tooltip="For liquid pressure measurement"
                          />
                          <FilterOption
                            label="Air"
                            isActive={filters.air}
                            onClick={() => setFilters((prev) => ({ ...prev, air: !prev.air }))}
                            tooltip="For air pressure measurement"
                          />
                        </>
                      )}
                    </div>
                  )}
                  <Button onClick={handleFilterApply} className="w-full bg-[#40C4FF] text-white hover:bg-blue-400">
                    {["level", "flow"].includes(selectedType) ? "Continue to Model Selection" : "Apply Filters"}
                  </Button>
                </div>
              </div>
            )}

            {step === "model" && (
              <div className="animate-fadeIn">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-200">Select Model</h3>
                  <div className="grid gap-4">
                    {getFilteredModels(selectedSensorType).map((modelOption: any) => (
                      <Button
                        key={modelOption.value}
                        onClick={() => handleModelSelect(modelOption.value)}
                        variant="outline"
                        className="justify-start text-left text-gray-200"
                      >
                        {modelOption.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === "specs" && (
              <div className="animate-fadeIn grid gap-6 md:grid-cols-2">
                {getRequiredSpecs().map((specType) => {
                  const specOptions = getSpecOptions(specType)
                  if (!specOptions.length) return null

                  return (
                    <div key={specType} className="space-y-2">
                      <label className="text-sm text-gray-200 capitalize">
                        {specType.replace(/([A-Z])/g, " $1").toLowerCase()}:
                      </label>
                      <Select
                        value={specs[specType] || ""}
                        onValueChange={(value) => handleSpecChange(specType, value)}
                      >
                        <SelectTrigger className="bg-[#1f2937] border-[#374151] text-gray-200">
                          <SelectValue placeholder={`Select ${specType.replace(/([A-Z])/g, " $1").toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1f2937] border-[#374151]">
                          {specOptions.map((option: any) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                              className="text-gray-200 hover:bg-[#374151]"
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Product Code Display */}
          {productCode && (
            <div className="pt-4 space-y-4 border-t border-[#2a3744]">
              <div>
                <div className="text-sm text-gray-200">Product Code:</div>
                <div className="text-lg font-medium text-[#40C4FF] mt-1" aria-live="polite">
                  {productCode}
                </div>
                <div className="text-sm text-gray-400 mt-2 leading-relaxed" aria-live="polite">
                  {getDetailedDescription()}
                </div>
                {model && (
                  <div className="mt-4">
                    {customProducts.find((p) => p.code === model)?.photoUrl ? (
                      <Image
                        src={customProducts.find((p) => p.code === model)?.photoUrl || ""}
                        alt={`${model} Product Image`}
                        width={300}
                        height={300}
                        className="rounded-lg border border-[#2a3744]"
                      />
                    ) : (
                      sensorModels[selectedType]?.find((m) => m.id === model)?.imageUrl && (
                        <Image
                          src={sensorModels[selectedType].find((m) => m.id === model)?.imageUrl || ""}
                          alt={`${model} Product Image`}
                          width={300}
                          height={300}
                          className="rounded-lg border border-[#2a3744]"
                        />
                      )
                    )}
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    className="text-[#40C4FF] border-[#40C4FF] hover:bg-[#2a3744]"
                  >
                    {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    {copied ? "Copied" : "Copy Code"}
                  </Button>
                  <Button
                    onClick={copyDescription}
                    variant="outline"
                    className="text-[#40C4FF] border-[#40C4FF] hover:bg-[#2a3744]"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Description
                  </Button>
                  <Button
                    onClick={handleDatasheetDownload}
                    variant="outline"
                    className="text-[#40C4FF] border-[#40C4FF] hover:bg-[#2a3744]"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Datasheet
                  </Button>
                </div>
              </div>
            </div>
          )}
          <ProductCodeFormat model={model} specifications={selectedSensorType?.specifications || {}} />
        </CardContent>
      </Card>
      {/* <ComparisonView selectedProducts={comparisonList} onRemove={removeFromComparison} /> */}
    </>
  )
}

