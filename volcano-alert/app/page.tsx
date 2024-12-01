'use client'

import React, { useEffect } from 'react'
import Script from 'next/script'
import Image from 'next/image'

export default function LandingPage() {
  useEffect(() => {
    // Initialize Genially embed when component mounts
    const script = document.createElement('script')
    script.src = 'https://view.genially.com/static/embed/embed.js'
    script.async = true
    script.id = 'genially-embed-js'
    document.body.appendChild(script)

    return () => {
      // Cleanup script when component unmounts
      const existingScript = document.getElementById('genially-embed-js')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            <span className="gradient-text">VulcaNicla</span>
            <span>: Next-Gen Volcanic Monitoring</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12">
            Revolutionizing volcanic monitoring with edge-AI powered sensors and real-time alerts. 
            Our affordable, all-in-one solution provides crucial early warning capabilities at a 
            fraction of traditional costs.
          </p>

          <div className="text-left bg-gray-50 p-8 rounded-lg shadow-sm">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">
              Why Choose Volcano Alert?
            </h3>
            
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="font-semibold text-gray-900 mr-2">•</span>
                <span>
                  <strong className="text-gray-900">Real-Time Monitoring:</strong>
                  {' '}Instant detection of volcanic activity
                </span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-gray-900 mr-2">•</span>
                <span>
                  <strong className="text-gray-900">Comprehensive Data:</strong>
                  {' '}Temperature, seismic, gas, and ground deformation monitoring
                </span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-gray-900 mr-2">•</span>
                <span>
                  <strong className="text-gray-900">AI-Powered Analysis:</strong>
                  {' '}Advanced prediction and early warning system
                </span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-gray-900 mr-2">•</span>
                <span>
                  <strong className="text-gray-900">Cost-Effective:</strong>
                  {' '}90% cheaper than traditional solutions*
                </span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-gray-900 mr-2">•</span>
                <span>
                  <strong className="text-gray-900">Easy Deployment:</strong>
                  {' '}Quick setup in remote locations
                </span>
              </li>
            </ul>
          </div>

          <p className="text-lg text-gray-700 mt-8 font-medium">
            Protecting communities through accessible, innovative technology.
          </p>
        </div>

        {/* Genially Container */}
        <div 
          className="container-wrapper-genially relative min-h-[800px] w-full max-w-[1200px] mx-auto mt-8"
          style={{ aspectRatio: '16/9' }}
        >
          {/* Loading Animation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <video
              className="w-20 h-20"
              autoPlay
              loop
              playsInline
              muted
            >
              <source 
                src="https://static.genially.com/resources/loader-default-rebranding.mp4" 
                type="video/mp4" 
              />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Genially Embed */}
          <div
            id="674bee45bfaef2fb8868c69e"
            className="genially-embed w-full h-full"
            style={{ 
              margin: '0 auto',
              position: 'relative',
              height: '100%',
              width: '100%'
            }}
          />
        </div>
      </div>
    </div>
  )
}
