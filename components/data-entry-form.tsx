"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Plus, Trash2, AlertCircle, Save, ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ImageUpload } from "@/components/image-upload"

type SpecificationOption = {
  value: string
  code: string
  label: string
}

type Specification = {
  name: string
  options: SpecificationOption[]
}

interface DataEntryFormProps {
  onProductAdded: () => void
  editingProduct: any | null
  showAdvanced?: boolean
}

export function DataEntryForm({ onProductAdded, editingProduct, showAdvanced = false }: DataEntryFormProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    category: "",
    type: "",
    name: "",
    datasheetUrl: "",
  })
  const [specifications, setSpecifications] = useState<Specification[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [photo, setPhoto] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingCategories, setEditingCategories] = useState(false)
  const [editingModels, setEditingModels] = useState(false)
  const [categories, setCategories] = useState([
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
  ])
  const [models, setModels] = useState({
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
  })

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        category: editingProduct.category || "",
        type: editingProduct.type || "",
        name: editingProduct.name || "",
        datasheetUrl: editingProduct.datasheetUrl || "",
      })
      setSpecifications(editingProduct.specifications || [])
      setPhoto(editingProduct.photo || null)
    }
  }, [editingProduct])

  const availableSensorTypes = useMemo(() => {
    const category = categories.find((cat) => cat.id === formData.category)
    return category?.types || []
  }, [formData.category, categories])

  const validateStep = (currentStep: number): boolean => {
    console.log("Validating step:", currentStep)
    const newErrors: Record<string, string> = {}

    switch (currentStep) {
      case 1:
        if (!formData.category) newErrors.category = "Category is required"
        if (!formData.type) newErrors.type = "Type is required"
        break
      case 2:
        if (!formData.name) newErrors.name = "Product name is required"
        if (formData.datasheetUrl && !isValidUrl(formData.datasheetUrl)) {
          newErrors.datasheetUrl = "Invalid URL format"
        }
        break
      case 3:
        if (specifications.length === 0) {
          newErrors.specifications = "At least one specification is required"
        } else {
          specifications.forEach((spec, index) => {
            if (!spec.name) {
              newErrors[`spec_${index}_name`] = "Specification name is required"
            }
            if (spec.options.length === 0) {
              newErrors[`spec_${index}_options`] = "At least one option is required"
            } else {
              spec.options.forEach((option, optIndex) => {
                if (!option.value) {
                  newErrors[`spec_${index}_option_${optIndex}_value`] = "Value is required"
                }
                if (!option.code) {
                  newErrors[`spec_${index}_option_${optIndex}_code`] = "Code is required"
                }
                if (!option.label) {
                  newErrors[`spec_${index}_option_${optIndex}_label`] = "Label is required"
                }
              })
            }
          })
        }
        break
    }

    console.log("Validation errors:", newErrors)
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prevStep) => Math.min(prevStep + 1, steps.length))
    }
  }

  const handlePrevious = () => {
    setStep((prevStep) => Math.max(prevStep - 1, 1))
  }

  const generateProductCode = (data: typeof formData, specs: Specification[]) => {
    const typePrefix = data.type.toUpperCase()
    const specCodes = specs.map(spec => {
      const firstOption = spec.options[0]
      return firstOption ? firstOption.code : ''
    }).join('-')
    
    return `${typePrefix}-${specCodes}`
  }

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted")

    if (!validateStep(step)) {
      console.log("Validation failed", errors)
      toast.error("Please fix validation errors")
      return
    }

    setIsSubmitting(true)
    try {
      const productCode = generateProductCode(formData, specifications)
      console.log("Generated code:", productCode)

      const productData = {
        ...formData,
        specifications,
        code: productCode,
        createdAt: new Date().toISOString(),
      }
      console.log("Product data:", productData)

      const formDataToSend = new FormData()
      formDataToSend.append("data", JSON.stringify(productData))
      
      if (photo) {
        formDataToSend.append("photo", photo)
      }

      console.log("Sending request...")
      const response = await fetch("/api/products", {
        method: editingProduct ? "PUT" : "POST",
        body: formDataToSend,
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save product")
      }

      const result = await response.json()
      console.log("Response data:", result)

      if (result.success) {
        toast.success(`Product ${editingProduct ? "updated" : "added"} successfully!`)
      resetForm()
        onProductAdded()
      } else {
        throw new Error(result.error || "Failed to save product")
      }
    } catch (error) {
      console.error("Error saving product:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save product")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { name: string; value: string },
  ) => {
    const { name, value } = e.target ? e.target : e
    setFormData((prev) => {
      if (name === "category") {
        return { ...prev, [name]: value, type: "" }
      }
      return { ...prev, [name]: value }
    })
    setErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const resetForm = () => {
    setFormData({
      category: "",
      type: "",
      name: "",
      datasheetUrl: "",
    })
    setSpecifications([])
    setPhoto(null)
    setStep(1)
    setErrors({})
  }

  const addSpecification = () => {
    setSpecifications((prev) => [...prev, { name: "", options: [] }])
  }

  const removeSpecification = (index: number) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index))
  }

  const updateSpecification = (index: number, field: string, value: string) => {
    setSpecifications((prev) => {
      const newSpecs = [...prev]
      newSpecs[index] = { ...newSpecs[index], [field]: value }
      return newSpecs
    })
  }

  const addOption = (specIndex: number) => {
    setSpecifications((prev) => {
      const newSpecs = [...prev]
      newSpecs[specIndex] = {
        ...newSpecs[specIndex],
        options: [...newSpecs[specIndex].options, { value: "", code: "", label: "" }]
      }
      return newSpecs
    })
  }

  const removeOption = (specIndex: number, optionIndex: number) => {
    setSpecifications((prev) => {
      const newSpecs = [...prev]
      newSpecs[specIndex] = {
        ...newSpecs[specIndex],
        options: newSpecs[specIndex].options.filter((_, i) => i !== optionIndex)
      }
      return newSpecs
    })
  }

  const updateOption = (specIndex: number, optionIndex: number, field: string, value: string) => {
    setSpecifications((prev) => {
      const newSpecs = [...prev]
      newSpecs[specIndex].options[optionIndex] = {
        ...newSpecs[specIndex].options[optionIndex],
        [field]: value
      }
      return newSpecs
    })
  }

  const handleCategoryEdit = async (categoryId: string, newName: string) => {
    const newCategories = categories.map(cat => 
      cat.id === categoryId ? { ...cat, name: newName } : cat
    )
    await saveCategories(newCategories)
  }

  const handleCategoryDelete = async (categoryId: string) => {
    const newCategories = categories.filter(cat => cat.id !== categoryId)
    setCategories(newCategories)
    await saveCategories(newCategories)
  }

  const handleTypeEdit = async (categoryId: string, typeId: string, newName: string) => {
    const newCategories = categories.map(cat => 
      cat.id === categoryId 
        ? {
            ...cat,
            types: cat.types.map(type => 
              type.id === typeId ? { ...type, name: newName } : type
            )
          }
        : cat
    )
    await saveCategories(newCategories)
  }

  const handleTypeDelete = (categoryId: string, typeId: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? {
            ...cat,
            types: cat.types.filter(type => type.id !== typeId)
          }
        : cat
    ))
  }

  const handleModelEdit = async (modelId: string, field: string, value: any) => {
    const newModels = {
      ...models,
      [modelId]: {
        ...models[modelId],
        [field]: value
      }
    }
    setModels(newModels)
    await saveModels(newModels)
  }

  const handleModelDelete = async (modelId: string) => {
    const newModels = { ...models }
    delete newModels[modelId]
    setModels(newModels)
    await saveModels(newModels)
  }

  const handleSpecificationEdit = async (modelId: string, specName: string, newOptions: any[]) => {
    const newModels = {
      ...models,
      [modelId]: {
        ...models[modelId],
        specifications: {
          ...models[modelId].specifications,
          [specName]: newOptions
        }
      }
    }
    setModels(newModels)
    await saveModels(newModels)
    toast.success(`Updated ${specName} options for ${models[modelId].name}`)
  }

  const handleModelSpecificationAdd = async (modelId: string, specName: string) => {
    const newModels = {
      ...models,
      [modelId]: {
        ...models[modelId],
        specifications: {
          ...models[modelId].specifications,
          [specName]: []
        }
      }
    }
    setModels(newModels)
    await saveModels(newModels)
    toast.success(`Added specification ${specName} to ${models[modelId].name}`)
  }

  const handleModelSpecificationDelete = async (modelId: string, specName: string) => {
    const newModels = { ...models }
    delete newModels[modelId].specifications[specName]
    setModels(newModels)
    await saveModels(newModels)
    toast.success(`Removed specification ${specName} from ${models[modelId].name}`)
  }

  const handleModelNameEdit = async (modelId: string, newName: string) => {
    const newModels = {
      ...models,
      [modelId]: {
        ...models[modelId],
        name: newName
      }
    }
    setModels(newModels)
    await saveModels(newModels)
    toast.success(`Updated model name to ${newName}`)
  }

  const steps = [
    {
      title: "Basic Information",
      fields: (
                <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white">Category</Label>
            <Select value={formData.category} onValueChange={(value) => handleChange({ name: "category", value })}>
                      <SelectTrigger className="bg-[#2a3744] border-[#3a4754] text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1B2531] border-[#3a4754]">
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id} className="text-white">
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
              <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors.category}</AlertDescription>
                      </Alert>
                    )}
                  </div>
          <div className="space-y-2">
            <Label className="text-white">Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => handleChange({ name: "type", value })}
              disabled={!formData.category}
                      >
                        <SelectTrigger className="bg-[#2a3744] border-[#3a4754] text-white">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1B2531] border-[#3a4754]">
                          {availableSensorTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id} className="text-white">
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.type && (
              <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{errors.type}</AlertDescription>
                        </Alert>
                      )}
                    </div>
          <div className="space-y-2">
            <Label className="text-white">Product Name</Label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="bg-[#2a3744] border-[#3a4754] text-white"
                    />
                    {errors.name && (
              <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors.name}</AlertDescription>
                      </Alert>
                    )}
                  </div>
          <div className="space-y-2">
            <Label className="text-white">Datasheet URL (optional)</Label>
                    <Input
                      name="datasheetUrl"
                      value={formData.datasheetUrl}
                      onChange={handleChange}
                      className="bg-[#2a3744] border-[#3a4754] text-white"
                    />
                    {errors.datasheetUrl && (
              <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors.datasheetUrl}</AlertDescription>
                      </Alert>
                    )}
                  </div>
          <ImageUpload
            onImageChange={setPhoto}
            currentImage={editingProduct?.photoUrl}
                    />
                  </div>
      )
    },
    {
      title: "Specifications",
      fields: (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Specifications</Label>
                    <Button
                      type="button"
                      onClick={addSpecification}
                      variant="outline"
                      size="sm"
                      className="text-[#40C4FF] border-[#40C4FF] hover:bg-[#2a3744]"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Specification
                    </Button>
                  </div>
                  {specifications.map((spec, specIndex) => (
                    <Card key={specIndex} className="bg-[#2a3744] border-[#3a4754]">
                      <CardContent className="space-y-4 pt-4">
                        <div className="flex items-center justify-between">
                          <Input
                            placeholder="Specification name (e.g., Accuracy)"
                            value={spec.name}
                            onChange={(e) => updateSpecification(specIndex, "name", e.target.value)}
                            className="flex-grow mr-2 bg-[#1B2531] border-[#3a4754] text-white"
                          />
                          <Button
                            type="button"
                            onClick={() => removeSpecification(specIndex)}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        {errors[`spec_${specIndex}_name`] && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{errors[`spec_${specIndex}_name`]}</AlertDescription>
                          </Alert>
                        )}
                        {spec.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-2">
                            <Input
                              placeholder="Value (e.g., ±3%RH)"
                              value={option.value}
                              onChange={(e) => updateOption(specIndex, optionIndex, "value", e.target.value)}
                              className="flex-grow bg-[#1B2531] border-[#3a4754] text-white"
                            />
                            <Input
                              placeholder="Code (e.g., 3)"
                              value={option.code}
                              onChange={(e) => updateOption(specIndex, optionIndex, "code", e.target.value)}
                              className="w-24 bg-[#1B2531] border-[#3a4754] text-white"
                            />
                            <Input
                              placeholder="Label (e.g., ±3%RH(±0.5℃))"
                              value={option.label}
                              onChange={(e) => updateOption(specIndex, optionIndex, "label", e.target.value)}
                              className="flex-grow bg-[#1B2531] border-[#3a4754] text-white"
                            />
                            <Button
                              type="button"
                              onClick={() => removeOption(specIndex, optionIndex)}
                              variant="destructive"
                              size="sm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        {errors[`spec_${specIndex}_options`] && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{errors[`spec_${specIndex}_options`]}</AlertDescription>
                          </Alert>
                        )}
                        <Button
                          type="button"
                          onClick={() => addOption(specIndex)}
                          variant="outline"
                          size="sm"
                          className="text-[#40C4FF] border-[#40C4FF] hover:bg-[#1B2531]"
                        >
                          <Plus className="w-4 h-4 mr-2" /> Add Option
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                  {errors.specifications && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.specifications}</AlertDescription>
                    </Alert>
                  )}
                </div>
      )
    },
    {
      title: "Review",
      fields: (
                <div className="space-y-4">
          <div className="bg-[#2a3744] p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-4">Review Product Details</h3>
            <div className="space-y-3">
                    <p className="text-gray-300">
                      <span className="font-medium">Category:</span> {formData.category}
                    </p>
                    <p className="text-gray-300">
                      <span className="font-medium">Type:</span> {formData.type}
                    </p>
                    <p className="text-gray-300">
                      <span className="font-medium">Name:</span> {formData.name}
                    </p>
                    <p className="text-gray-300">
                      <span className="font-medium">Datasheet URL:</span> {formData.datasheetUrl}
                    </p>
                    {photo && (
                <div className="text-gray-300">
                  <span className="font-medium">Product Image:</span>
                  <div className="mt-2">
                    <div className="w-[100px] h-[100px] relative">
                      <img 
                        src={typeof photo === 'string' ? photo : URL.createObjectURL(photo)} 
                        alt="Product preview"
                        className="rounded-lg w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
                    )}
                    <div className="text-gray-300">
                      <span className="font-medium">Specifications:</span>
                      <ul className="list-disc list-inside ml-4 mt-2">
                        {specifications.map((spec, index) => (
                          <li key={index}>
                            {spec.name}: {spec.options.map((opt) => opt.label).join(", ")}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
          <div className="bg-[#2a3744] p-4 rounded-lg">
            <Label className="text-[#40C4FF]">Generated Product Code</Label>
            <div className="mt-2 font-mono text-lg text-white">
              {generateProductCode(formData, specifications) || 'Complete the form to see the product code'}
                </div>
              </div>
        </div>
      )
    }
  ]

  const refreshData = async () => {
    try {
      const response = await fetch("/api/settings")
      if (!response.ok) {
        throw new Error("Failed to fetch settings")
      }
      const data = await response.json()
      
      if (data.categories && Array.isArray(data.categories)) {
        setCategories(data.categories)
      }
      if (data.models && typeof data.models === 'object') {
        setModels(data.models)
      }
    } catch (error) {
      console.error("Error refreshing data:", error)
      toast.error("Failed to refresh settings")
    }
  }

  const saveCategories = async (newCategories: any) => {
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: newCategories }),
      })

      if (!response.ok) {
        throw new Error("Failed to save categories")
      }

      await refreshData()
      toast.success("Categories updated successfully")
    } catch (error) {
      console.error("Error saving categories:", error)
      toast.error("Failed to save categories")
    }
  }

  const saveModels = async (newModels: any) => {
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ models: newModels }),
      })

      if (!response.ok) {
        throw new Error("Failed to save models")
      }

      await refreshData()
      toast.success("Models updated successfully")
    } catch (error) {
      console.error("Error saving models:", error)
      toast.error("Failed to save models")
    }
  }

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/settings")
        if (!response.ok) {
          throw new Error("Failed to fetch settings")
        }
        const data = await response.json()
        
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories)
        }
        if (data.models && Object.keys(data.models).length > 0) {
          setModels(data.models)
        }
      } catch (error) {
        console.error("Error loading settings:", error)
        toast.error("Failed to load settings")
      }
    }

    loadSettings()
  }, [])

  useEffect(() => {
    console.log("Current categories:", categories)
    console.log("Current models:", models)
  }, [categories, models])

  return (
    <Card className="bg-[#1B2531] border-[#2a3744]">
      <CardHeader>
        <CardTitle className="text-[#40C4FF]">
          {editingProduct ? "Edit Product" : "Add New Product"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="mb-6">
          <Progress value={(step / steps.length) * 100} className="bg-[#2a3744]" />
          <div className="flex justify-between mt-2 text-sm text-gray-400">
            {steps.map((s, i) => (
              <span key={i} className={step > i ? "text-[#40C4FF]" : ""}>
                {s.title}
              </span>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {steps[step - 1].fields}

          <div className="flex justify-between mt-6">
            {step > 1 && (
              <Button type="button" onClick={handlePrevious} variant="outline" className="text-white">
                <ArrowLeft className="w-4 h-4 mr-2" /> Previous
              </Button>
            )}
            {step < steps.length && (
              <Button type="button" onClick={handleNext} className="bg-[#40C4FF] text-white hover:bg-blue-400">
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
            {step === steps.length && (
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-[#40C4FF] text-white hover:bg-blue-400 w-full"
                onClick={handleSubmit}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {editingProduct ? "Update Product" : "Add Product"}
                  </>
                )}
              </Button>
            )}
          </div>
        </form>

        {showAdvanced && (
          <div className="mt-8 pt-8 border-t border-[#2a3744]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-[#40C4FF]">Advanced Settings</h3>
              <div className="space-x-2">
                <Button
                  onClick={() => setEditingCategories(!editingCategories)}
                  variant="outline"
                  className="text-[#40C4FF] border-[#40C4FF]"
                >
                  {editingCategories ? "Done Editing Categories" : "Edit Categories"}
                </Button>
                <Button
                  onClick={() => setEditingModels(!editingModels)}
                  variant="outline"
                  className="text-[#40C4FF] border-[#40C4FF]"
                >
                  {editingModels ? "Done Editing Models" : "Edit Models"}
                </Button>
              </div>
            </div>
            
            {editingCategories && categories.length > 0 && (
              <div className="space-y-4">
                {categories.map((category) => (
                  <Card key={category.id} className="bg-[#2a3744] border-[#3a4754]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <Input
                        value={category.name}
                        onChange={(e) => handleCategoryEdit(category.id, e.target.value)}
                        className="bg-[#1B2531] border-[#3a4754] text-white max-w-[300px]"
                      />
                      <Button
                        onClick={() => handleCategoryDelete(category.id)}
                        variant="destructive"
                        size="sm"
                        className="text-white"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {category.types.map((type) => (
                          <div key={type.id} className="flex items-center space-x-2">
                            <Input
                              value={type.name}
                              onChange={(e) => handleTypeEdit(category.id, type.id, e.target.value)}
                              className="bg-[#1B2531] border-[#3a4754] text-white"
                            />
                            <Button
                              onClick={() => handleTypeDelete(category.id, type.id)}
                              variant="destructive"
                              size="sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          onClick={() => {
                            const newType = {
                              id: `new-type-${Date.now()}`,
                              name: "New Type"
                            }
                            setCategories(prev => prev.map(cat => 
                              cat.id === category.id 
                                ? { ...cat, types: [...cat.types, newType] }
                                : cat
                            ))
                          }}
                          variant="outline"
                          size="sm"
                          className="text-[#40C4FF] border-[#40C4FF]"
                        >
                          Add Type
                        </Button>
                      </div>
      </CardContent>
    </Card>
                ))}
                <Button
                  onClick={() => {
                    const newCategory = {
                      id: `new-category-${Date.now()}`,
                      name: "New Category",
                      types: []
                    }
                    setCategories(prev => [...prev, newCategory])
                  }}
                  className="text-[#40C4FF] border-[#40C4FF]"
                  variant="outline"
                >
                  Add Category
                </Button>
              </div>
            )}

            {editingModels && (
              <div className="space-y-4">
                {Object.entries(models).map(([modelId, model]) => (
                  <Card key={modelId} className="bg-[#2a3744] border-[#3a4754]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <Input
                        value={model.name}
                        onChange={(e) => handleModelEdit(modelId, 'name', e.target.value)}
                        className="bg-[#1B2531] border-[#3a4754] text-white max-w-[300px]"
                      />
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => {
                            const specName = prompt("Enter specification name:")
                            if (specName) handleModelSpecificationAdd(modelId, specName)
                          }}
                          variant="outline"
                          size="sm"
                          className="text-[#40C4FF] border-[#40C4FF]"
                        >
                          Add Specification
                        </Button>
                        <Button
                          onClick={() => handleModelDelete(modelId)}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(model.specifications).map(([specName, options]) => (
                          <div key={specName} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-white">{specName}</Label>
                              <Button
                                onClick={() => handleModelSpecificationDelete(modelId, specName)}
                                variant="destructive"
                                size="sm"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            {options.map((option: any, index: number) => (
                              <div key={index} className="flex items-center space-x-2">
                                <Input
                                  value={option.value}
                                  onChange={(e) => {
                                    const newOptions = [...options]
                                    newOptions[index] = { ...option, value: e.target.value }
                                    handleSpecificationEdit(modelId, specName, newOptions)
                                  }}
                                  className="bg-[#1B2531] border-[#3a4754] text-white"
                                  placeholder="Value"
                                />
                                <Input
                                  value={option.code}
                                  onChange={(e) => {
                                    const newOptions = [...options]
                                    newOptions[index] = { ...option, code: e.target.value }
                                    handleSpecificationEdit(modelId, specName, newOptions)
                                  }}
                                  className="bg-[#1B2531] border-[#3a4754] text-white w-24"
                                  placeholder="Code"
                                />
                                <Input
                                  value={option.label}
                                  onChange={(e) => {
                                    const newOptions = [...options]
                                    newOptions[index] = { ...option, label: e.target.value }
                                    handleSpecificationEdit(modelId, specName, newOptions)
                                  }}
                                  className="bg-[#1B2531] border-[#3a4754] text-white"
                                  placeholder="Label"
                                />
                                <Button
                                  onClick={() => {
                                    const newOptions = options.filter((_: any, i: number) => i !== index)
                                    handleSpecificationEdit(modelId, specName, newOptions)
                                  }}
                                  variant="destructive"
                                  size="sm"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              onClick={() => {
                                const newOption = { value: "", code: "", label: "" }
                                handleSpecificationEdit(modelId, specName, [...options, newOption])
                              }}
                              variant="outline"
                              size="sm"
                              className="text-[#40C4FF] border-[#40C4FF]"
                            >
                              Add Option
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button
                  onClick={() => {
                    const modelId = `model-${Date.now()}`
                    const newModels = {
                      ...models,
                      [modelId]: {
                        name: "New Model",
                        specifications: {}
                      }
                    }
                    setModels(newModels)
                    saveModels(newModels)
                  }}
                  className="text-[#40C4FF] border-[#40C4FF]"
                  variant="outline"
                >
                  Add Model
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}