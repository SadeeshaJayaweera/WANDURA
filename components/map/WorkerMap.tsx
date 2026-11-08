'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Navigation,
  MapPin,
  Star,
  Shield,
  Layers,
  Crosshair,
  Loader2,
  ExternalLink,
  Info,
} from 'lucide-react'
import { formatCurrency, calculateDistance } from '@/lib/utils'
import { getSkillLabel, findNearestCity } from '@/lib/srilanka'

interface WorkerMapProps {
  workers: any[]
  userLocation?: { lat: number; lng: number } | null
  onLocationFound?: (loc: { lat: number; lng: number; city: string }) => void
  selectedWorkerId?: string | null
}

export default function WorkerMap({
  workers,
  userLocation,
  onLocationFound,
  selectedWorkerId,
}: WorkerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const userMarkerRef = useRef<any>(null)
  const [locating, setLocating] = useState(false)
  const [locationStatus, setLocationStatus] = useState<string | null>(null)
  const [currentUserLoc, setCurrentUserLoc] = useState<{ lat: number; lng: number } | null>(
    userLocation || null
  )

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return

      // Dynamically import Leaflet in browser only
      const L = (await import('leaflet')).default

      // Inject Leaflet CSS if not already present
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link')
        link.id = 'leaflet-css'
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }

      if (!isMounted || !mapContainerRef.current) return

      // Default Sri Lanka center (Colombo area)
      const defaultCenter: [number, number] = [6.9271, 79.8612]
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 9,
        zoomControl: false,
      })

      // Add zoom control at bottom-right
      L.control.zoom({ position: 'bottomright' }).addTo(map)

      // Clean OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map)

      mapInstanceRef.current = map

      // Click to pick location
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng
        setCurrentUserLoc({ lat, lng })
        const nearest = findNearestCity(lat, lng)
        setLocationStatus(`Selected: ${nearest.name} (${nearest.sinhala})`)
        if (onLocationFound) {
          onLocationFound({ lat, lng, city: nearest.name })
        }
      })
    }

    initMap()

    return () => {
      isMounted = false
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Update User Location Marker
  useEffect(() => {
    if (!mapInstanceRef.current || !currentUserLoc) return

    import('leaflet').then((LModule) => {
      const L = LModule.default
      const map = mapInstanceRef.current
      if (!map) return

      if (userMarkerRef.current) {
        userMarkerRef.current.remove()
      }

      // Custom pulsing user location marker
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
          <div style="
            width: 22px;
            height: 22px;
            background: #2563EB;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(37, 99, 235, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      })

      userMarkerRef.current = L.marker([currentUserLoc.lat, currentUserLoc.lng], {
        icon: userIcon,
        zIndexOffset: 1000,
      })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: sans-serif; font-size: 13px; padding: 4px;">
            <strong style="color: #2563EB;">📍 ඔබ සිටින ස්ථානය (Your Location)</strong>
            <p style="margin: 4px 0 0; color: #64748B; font-size: 11px;">
              Lat: ${currentUserLoc.lat.toFixed(4)}, Lng: ${currentUserLoc.lng.toFixed(4)}
            </p>
          </div>
        `)
    })
  }, [currentUserLoc])

  // Update Worker Markers
  useEffect(() => {
    if (!mapInstanceRef.current) return

    import('leaflet').then((LModule) => {
      const L = LModule.default
      const map = mapInstanceRef.current
      if (!map) return

      // Clear previous markers
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []

      const validWorkers = workers.filter((w) => w.latitude && w.longitude)

      validWorkers.forEach((worker) => {
        const skillInfo = getSkillLabel(worker.skill)
        const rateFormatted = formatCurrency(worker.dailyRate)

        // Calculate distance if user location is available
        let distanceText = ''
        if (currentUserLoc) {
          const distKm = calculateDistance(
            currentUserLoc.lat,
            currentUserLoc.lng,
            worker.latitude,
            worker.longitude
          )
          distanceText = `<p style="margin: 4px 0; color: #0284C7; font-weight: 600; font-size: 11px;">📍 දුර (Distance): ~${distKm.toFixed(1)} km</p>`
        }

        const isSelected = selectedWorkerId === worker.id || selectedWorkerId === worker.userId

        // Worker icon with skill symbol
        const workerIcon = L.divIcon({
          className: 'worker-map-marker',
          html: `
            <div style="
              background: ${isSelected ? '#1D4ED8' : '#2563EB'};
              color: white;
              padding: 4px 8px;
              border-radius: 12px;
              font-weight: bold;
              font-size: 11px;
              font-family: sans-serif;
              display: flex;
              align-items: center;
              gap: 4px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.2);
              border: 2px solid white;
              white-space: nowrap;
              cursor: pointer;
              transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
              transition: transform 0.2s ease;
            ">
              <span>${worker.isVerified ? '✓ ' : ''}${rateFormatted}</span>
            </div>
          `,
          iconSize: [80, 28],
          iconAnchor: [40, 14],
        })

        const marker = L.marker([worker.latitude, worker.longitude], {
          icon: workerIcon,
        }).addTo(map)

        const popupHtml = `
          <div style="font-family: sans-serif; min-width: 200px; padding: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 4px;">
              <h4 style="margin: 0; font-size: 14px; font-weight: bold; color: #0F172A;">
                ${worker.user?.name || 'Worker'}
              </h4>
            </div>
            <p style="margin: 0 0 6px; font-size: 12px; color: #2563EB; font-weight: 600;">
              ${skillInfo}
            </p>
            <p style="margin: 0 0 4px; font-size: 11px; color: #64748B;">
              📍 ${worker.city || 'Sri Lanka'}, ${worker.state || ''}
            </p>
            ${distanceText}
            <div style="display: flex; justify-content: space-between; align-items: center; margin: 8px 0; border-top: 1px solid #F1F5F9; padding-top: 6px;">
              <span style="font-size: 12px; color: #EAB308; font-weight: bold;">★ ${worker.rating?.toFixed(1) || '5.0'}</span>
              <span style="font-size: 13px; font-weight: bold; color: #0F172A;">${rateFormatted}/day</span>
            </div>
            <a href="/workers/${worker.userId}" style="
              display: block;
              text-align: center;
              background: #2563EB;
              color: white;
              text-decoration: none;
              padding: 6px 12px;
              border-radius: 8px;
              font-size: 12px;
              font-weight: 600;
              margin-top: 6px;
            ">View Profile & Book (තොරතුරු බලන්න)</a>
          </div>
        `

        marker.bindPopup(popupHtml)
        markersRef.current.push(marker)
      })

      // If we have workers and no custom user zoom, fit bounds to show all workers
      if (validWorkers.length > 0 && !currentUserLoc) {
        const bounds = L.latLngBounds(validWorkers.map((w) => [w.latitude, w.longitude]))
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 })
      }
    })
  }, [workers, currentUserLoc, selectedWorkerId])

  // Geolocation trigger
  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser')
      return
    }

    setLocating(true)
    setLocationStatus('Fetching GPS location in Sri Lanka...')

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        setCurrentUserLoc({ lat, lng })
        const nearestCity = findNearestCity(lat, lng)
        setLocationStatus(`Found location near: ${nearestCity.name} (${nearestCity.sinhala})`)
        setLocating(false)

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 13, { duration: 1.5 })
        }

        if (onLocationFound) {
          onLocationFound({ lat, lng, city: nearestCity.name })
        }
      },
      (err) => {
        setLocating(false)
        console.warn('Geolocation error:', err.message)
        // Fallback to Colombo
        const colombo = { lat: 6.9271, lng: 79.8612 }
        setCurrentUserLoc(colombo)
        setLocationStatus('Could not access GPS. Defaulted to Colombo (කොළඹ).')
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([colombo.lat, colombo.lng], 11)
        }
        if (onLocationFound) {
          onLocationFound({ lat: colombo.lat, lng: colombo.lng, city: 'Colombo' })
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    )
  }

  const handleCenterSriLanka = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([7.8731, 80.7718], 8)
    }
  }

  return (
    <div className="relative w-full h-[450px] md:h-[520px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100">
      {/* Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Controls */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2">
          <Button
            onClick={handleFetchLocation}
            disabled={locating}
            className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 rounded-xl shadow-md h-10 px-4 gap-2 text-xs font-semibold"
          >
            {locating ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            ) : (
              <Navigation className="h-4 w-4 text-blue-600" />
            )}
            <span>📍 Use My Location (මගේ ස්ථානය)</span>
          </Button>

          <Button
            onClick={handleCenterSriLanka}
            variant="outline"
            className="bg-white/95 hover:bg-white text-gray-700 border border-gray-200 rounded-xl shadow-sm h-10 px-3 text-xs font-medium"
            title="Fit Sri Lanka"
          >
            <Layers className="h-4 w-4 text-gray-500" />
            <span className="hidden sm:inline ml-1">Sri Lanka (ශ්‍රී ලංකාව)</span>
          </Button>
        </div>

        {/* Status / Instruction Pill */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm text-xs text-gray-600 flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
          <span className="truncate max-w-xs">
            {locationStatus || 'Click map to select job site or tap "Use My Location"'}
          </span>
        </div>
      </div>

      {/* Bottom Floating Legend */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl px-3 py-2 shadow-sm text-xs text-gray-700 flex items-center gap-3 pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 inline-block border border-white"></span>
            <span className="font-medium">{workers.length} Skilled Workers</span>
          </div>
          {currentUserLoc && (
            <div className="flex items-center gap-1.5 border-l pl-3 border-gray-200">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-300 animate-pulse"></span>
              <span className="font-medium text-blue-700">Your Location</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

