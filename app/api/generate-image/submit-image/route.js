// app/api/submit-image/route.js
import { NextResponse } from 'next/server'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore'

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
}

// Initialize Firebase if config is available
let db = null;
if (firebaseConfig.apiKey) {
  try {
    const app = initializeApp(firebaseConfig)
    db = getFirestore(app)
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
}

// Create a simple JSON file-based storage if Firebase isn't available
// This is for development and demo purposes only
const submissions = [];

export async function POST(request) {
  try {
    const { prompt, imageUrl, timestamp } = await request.json()
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      )
    }
    
    // Build submission data
    const submissionData = {
      prompt: prompt || '',
      imageUrl,
      status: 'pending', // pending, approved, rejected
      createdAt: new Date().toISOString(),
      clientTimestamp: timestamp || new Date().toISOString(),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    }
    
    let submissionId = '';
    
    // Use Firebase if available
    if (db) {
      try {
        const docRef = await addDoc(collection(db, 'submissions'), {
          ...submissionData,
          createdAt: serverTimestamp()
        })
        submissionId = docRef.id;
      } catch (error) {
        console.error("Firebase write error:", error);
        // Fall back to in-memory storage
        submissionId = `local-${Date.now()}`;
        submissions.push({
          id: submissionId,
          ...submissionData
        });
      }
    } else {
      // Store in memory for demo purposes
      submissionId = `local-${Date.now()}`;
      submissions.push({
        id: submissionId,
        ...submissionData
      });
      console.log("Stored submission in memory:", submissionId);
      console.log("Total submissions:", submissions.length);
    }
    
    return NextResponse.json({ 
      success: true,
      submissionId: submissionId,
      // For demo purposes, also indicate if we're using Firebase or local storage
      storageType: db ? 'firebase' : 'local'
    })
    
  } catch (error) {
    console.error('Error submitting image:', error)
    
    return NextResponse.json(
      { error: 'Failed to submit image: ' + (error.message || 'Unknown error') },
      { status: 500 }
    )
  }
}
