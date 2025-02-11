"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImagePlus, X, Image as ImageIcon } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  onImageChange: (file: File | null) => void
  currentImage?: string | null
}

export function ImageUpload({ onImageChange, currentImage }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image size should be less than 5MB")
        return
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload an image file")
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      onImageChange(file)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onImageChange(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <Label className="text-white">Product Image</Label>
      <div className="flex items-center gap-4">
        {preview ? (
          <div className="relative w-32 h-32">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover rounded-lg"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="w-32 h-32 border-2 border-dashed border-[#3a4754] rounded-lg flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-[#3a4754]" />
          </div>
        )}
        <div className="flex-1">
          <Input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="image-upload"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            className="w-full text-[#40C4FF] border-[#40C4FF]"
          >
            <ImagePlus className="mr-2 h-4 w-4" />
            {preview ? "Change Image" : "Upload Image"}
          </Button>
          <p className="text-sm text-gray-400 mt-2">
            Max size: 5MB. Supported formats: JPG, PNG, GIF
          </p>
        </div>
      </div>
    </div>
  )
} 