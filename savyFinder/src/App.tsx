import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'







function App() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold">
          Welcome to my App
        </h1>
        <p className="mt-2 text-gray-600">
          Built with Vite + React + TailwindCSS 🚀
        </p>
      </div>
    </div>
  )
}

export default App
