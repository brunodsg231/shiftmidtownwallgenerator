// app/layout.js
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'SHIFT Midtown - AI Image Generator',
  description: 'Create AI-generated images to be displayed at SHIFT Midtown immersive space',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="bg-black text-white py-4">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold">SHIFT Midtown</h1>
            <p className="text-sm text-gray-400">Immersive Projection Experience</p>
          </div>
        </header>
        <main>
          {children}
        </main>
        <footer className="bg-gray-100 py-6 mt-12">
          <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
            <p>&copy; {new Date().getFullYear()} SHIFT Midtown. All rights reserved.</p>
            <p className="mt-2">
              <a href="#privacy" className="underline hover:text-gray-900 mr-4">Privacy Policy</a>
              <a href="#terms" className="underline hover:text-gray-900">Terms of Use</a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
