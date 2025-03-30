// app/page.js
'use client'

import { useState, useRef } from 'react'
import { Loader2, Upload, Download, Share2, Send } from 'lucide-react'
import ProjectionSimulator from '../components/ProjectionSimulator'
import ImageUploader from '../components/ImageUploader'

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('')
  const [uploadedImage, setUploadedImage] = useState(null)
  const [generatedImage, setGeneratedImage] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handlePromptChange = (e) => {
    setPrompt(e.target.value)
  }

  const handleImageUpload = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setUploadedImage(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  const handleGenerate = async () => {
    if (!prompt && !uploadedImage) {
      setError('Please enter a prompt or upload an image')
      return
    }

    try {
      setIsGenerating(true)
      setError(null)

      const formData = new FormData()
      formData.append('prompt', prompt)
      
      if (uploadedImage) {
        // Convert base64 to blob
        const response = await fetch(uploadedImage)
        const blob = await response.blob()
        formData.append('image', blob)
      }

      const res = await fetch('/api/generate-image', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error('Failed to generate image')
      }

      const data = await res.json()
      setGeneratedImage(data.imageUrl)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = async () => {
    if (!generatedImage) return

    try {
      setIsSubmitting(true)
      
      const res = await fetch('/api/submit-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          imageUrl: generatedImage,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to submit image')
      }

      alert('Image submitted successfully! It may be displayed in SHIFT Midtown soon.')
    } catch (err) {
      setError(err.message || 'Failed to submit image')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownload = () => {
    if (!generatedImage) return
    
    const a = document.createElement('a')
    a.href = generatedImage
    a.download = `shift-midtown-${Date.now()}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleShare = async () => {
    if (!generatedImage || !navigator.share) return
    
    try {
      await navigator.share({
        title: 'My SHIFT Midtown Creation',
        text: `Check out my AI creation for SHIFT Midtown: ${prompt}`,
        url: generatedImage,
      })
    } catch (err) {
      console.error('Error sharing:', err)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        SHIFT Midtown Image Generator
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="prompt" className="block text-sm font-medium">
              Enter your prompt
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={handlePromptChange}
              rows={4}
              className="w-full rounded-md border border-gray-300 shadow-sm p-2"
              placeholder="Describe what you want to see projected at SHIFT Midtown..."
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Or upload an image</p>
            <ImageUploader onImageUpload={handleImageUpload} />
            
            {uploadedImage && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">Image uploaded</p>
                <img 
                  src={uploadedImage} 
                  alt="Uploaded" 
                  className="mt-2 max-h-48 rounded-md" 
                />
              </div>
            )}
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || (!prompt && !uploadedImage)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center justify-center disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin mr-2 h-5 w-5" />
                Generating...
              </>
            ) : (
              'Generate Image'
            )}
          </button>

          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Preview</h2>
          <ProjectionSimulator image={generatedImage} />

          {generatedImage && (
            <div className="flex space-x-2">
              <button
                onClick={handleDownload}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md flex items-center justify-center"
              >
                <Download className="mr-2 h-5 w-5" />
                Download
              </button>
              <button
                onClick={handleShare}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md flex items-center justify-center"
              >
                <Share2 className="mr-2 h-5 w-5" />
                Share
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md flex items-center justify-center disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                ) : (
                  <Send className="mr-2 h-5 w-5" />
                )}
                Submit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
