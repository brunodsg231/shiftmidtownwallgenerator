// components/ImageUploader.jsx
'use client'

import { useState, useRef } from 'react'
import { Upload } from 'lucide-react'

export default function ImageUploader({ onImageUpload }) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (isValidImageFile(file)) {
        onImageUpload(file)
      } else {
        alert('Please upload a valid image file (JPG, PNG, GIF, WEBP)')
      }
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (isValidImageFile(file)) {
        onImageUpload(file)
      } else {
        alert('Please upload a valid image file (JPG, PNG, GIF, WEBP)')
      }
    }
  }

  const isValidImageFile = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    return validTypes.includes(file.type)
  }

  const triggerFileInput = () => {
    fileInputRef.current.click()
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={triggerFileInput}
      className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer transition ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
      />
      <Upload className="h-8 w-8 text-gray-400 mb-2" />
      <p className="text-sm text-gray-500">
        Drag and drop an image, or click to browse
      </p>
      <p className="text-xs text-gray-400 mt-1">
        JPG, PNG, GIF, WEBP up to 5MB
      </p>
    </div>
  )
}
