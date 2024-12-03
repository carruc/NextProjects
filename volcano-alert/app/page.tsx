'use client'

import React, { useEffect } from 'react'
import Script from 'next/script'
import Image from 'next/image'
import { FeatureCard } from '@/components/FeatureCard'
import './styles/feature-carousel.css'

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
        <div className="mx-auto mb-16">
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 text-left">
              <span className="gradient-text">VulcaNicla</span>
              <span>: Next-Gen Volcanic Monitoring</span>
            </h1>
            
            <p className="text-2xl font-light text-gray-800 tracking-wide text-left">
              Protecting communities through accessible, innovative technology.
            </p>
          </div>

          <p className="text-xl text-gray-900 mb-12 text-left mt-8">
            We aim at revolutionizing volcanic monitoring with edge-AI powered sensors and real-time alerts. 
            Our affordable, all-in-one solution provides crucial early warning capabilities at a 
            fraction of traditional costs.
          </p>

          {/* Features Section - Replaced the bg-gray-50 div */}
          <div className="mt-16">
            <h3 className="text-2xl font-semibold text-gray-800 mb-10 text-center">
              Why choose VulcaNicla?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <FeatureCard 
                title="Real-Time Monitoring"
                description="Instant detection of volcanic activity"
              />
              <FeatureCard 
                title="Comprehensive Data"
                description="Temperature, seismic, gas, and ground deformation monitoring"
              />
              <FeatureCard 
                title="AI-Powered Analysis"
                description="Advanced prediction and early warning system"
              />
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[66%] mx-auto">
                <FeatureCard 
                  title="Cost-Effective"
                  description="90% cheaper than traditional solutions*"
                />
                <FeatureCard 
                  title="Easy Deployment"
                  description="Quick setup in remote locations"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mission introduction */}
        <div className="text-center my-24">
          <p className="text-2xl font-light text-gray-800">
            Let us introduce our mission:
          </p>
        </div>

        {/* Genially Container */}
        <div 
          className="container-wrapper-genially relative w-full mx-auto mt-8"
          style={{ minHeight: '80vh' }}
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
