"use client"

import { useEffect, useState } from "react"

interface ImagePreviewProps {
  file: File | string | null
  className?: string
}

export function ImagePreview({ file, className }: ImagePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }

    if (typeof file === 'string') {
      setPreviewUrl(file)
      return
    }

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    return () => URL.revokeObjectURL(url)
  }, [file])

  if (!previewUrl) return null

  return (
    <img
      src={previewUrl}
      alt="Preview"
      className={className}
    />
  )
} 