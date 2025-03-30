// app/api/generate-image/route.js
import { NextResponse } from 'next/server'
import { initializeApp } from 'firebase/app'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { v4 as uuidv4 } from 'uuid'

// Firebase configuration - we'll get these from environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
}

// Initialize Firebase if config is available
let storage = null;
if (firebaseConfig.apiKey) {
  const app = initializeApp(firebaseConfig)
  storage = getStorage(app)
}

export async function POST(request) {
  try {
    const formData = await request.formData()
    const prompt = formData.get('prompt')
    const image = formData.get('image')
    
    if (!prompt && !image) {
      return NextResponse.json(
        { error: 'Please provide a prompt or an image' },
        { status: 400 }
      )
    }
    
    // Call the appropriate API based on input
    let generatedImage
    
    if (image) {
      // Use image-to-image generation
      generatedImage = await generateImageFromImage(prompt, image)
    } else {
      // Use text-to-image generation
      generatedImage = await generateImageFromPrompt(prompt)
    }
    
    // If Firebase is configured, upload the generated image
    let imageUrl = generatedImage
    
    if (storage) {
      const imageId = uuidv4()
      const imageBuffer = await fetch(generatedImage).then(res => res.arrayBuffer())
      const imageBlob = new Blob([imageBuffer], { type: 'image/png' })
      
      const storageRef = ref(storage, `generated-images/${imageId}.png`)
      await uploadBytes(storageRef, imageBlob)
      
      // Get the download URL
      imageUrl = await getDownloadURL(storageRef)
    }
    
    return NextResponse.json({ 
      success: true,
      imageUrl: imageUrl
    })
    
  } catch (error) {
    console.error('Error generating image:', error)
    
    return NextResponse.json(
      { error: 'Failed to generate image' + (error.message ? `: ${error.message}` : '') },
      { status: 500 }
    )
  }
}

// Function to generate image from text prompt using Hugging Face free API
async function generateImageFromPrompt(prompt) {
  const enhancedPrompt = `${prompt} in immersive digital art style for SHIFT Midtown projection space`
  
  // Use Hugging Face's Inference API with Stable Diffusion model
  // This is a free API with rate limits
  const response = await fetch("https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // We'll use a free Hugging Face API token that can be obtained for free
      "Authorization": `Bearer ${process.env.HUGGINGFACE_API_TOKEN || 'hf_demo'}`
    },
    body: JSON.stringify({
      inputs: enhancedPrompt,
      parameters: {
        negative_prompt: "blurry, distorted, low quality, incomplete",
        num_inference_steps: 30,
        guidance_scale: 7.5
      }
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Hugging Face API error: ${errorText || response.statusText}`);
  }
  
  // The response is the image in binary format
  const imageBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(imageBuffer).toString('base64');
  
  return `data:image/jpeg;base64,${base64}`;
}

// Function to generate image from another image using Hugging Face Inference API
async function generateImageFromImage(prompt, imageFile) {
  const enhancedPrompt = prompt 
    ? `${prompt} in immersive digital art style for SHIFT Midtown projection space`
    : "Transform this into immersive digital art style for SHIFT Midtown projection space"
  
  // Convert image file to base64
  const imageBuffer = await imageFile.arrayBuffer()
  const base64Image = Buffer.from(imageBuffer).toString('base64')
  
  // For now, fallback to text-to-image generation (free tier limitation)
  // Many img2img models on Hugging Face require paid access
  // We can use a simpler approach with just the text prompt
  
  const fallbackResult = await generateImageFromPrompt(enhancedPrompt);
  return fallbackResult;
}
