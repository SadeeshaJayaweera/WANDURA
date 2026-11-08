'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Loader } from '@googlemaps/js-api-loader'
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
  Globe,
  Compass,
  Map as MapIcon,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { formatCurrency, calculateDistance } from '@/lib/utils'
import { getSkillLabel, findNearestCity } from '@/lib/srilanka'
import { useLanguage } from '@/components/providers/LanguageProvider'

declare global {
  interface Window {
    google?: any
  }
}

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
  const { isSinhala, t } = useLanguage()
  const mapContainerRef = useRef<HTMLDivElement>(null)
  
  // Map engine references
  const leafletMapRef = useRef<any>(null)
  const leafletMarkersRef = useRef<any[]>([])
  const leafletUserMarkerRef = useRef<any>(null)

  const googleMapRef = useRef<any>(null)
  const googleMarkersRef = useRef<any[]>([])
  const googleUserMarkerRef = useRef<any>(null)
  const googleInfoWindowRef = useRef<any>(null)

  // Map Provider state: 'google-roadmap' | 'google-satellite' | 'leaflet'
  const [mapEngine, setMapEngine] = useState<'google' | 'leaflet'>('google')
  const [googleMapType, setGoogleMapType] = useState<'roadmap' | 'satellite'>('roadmap')
  const [googleLoaded, setGoogleLoaded] = useState(false)
  const [googleError, setGoogleError] = useState<string | null>(null)

  const [locating, setLocating] = useState(false)
  const [locationStatus, setLocationStatus] = useState<string | null>(null)
  const [currentUserLoc, setCurrentUserLoc] = useState<{ lat: number; lng: number } | null>(
    userLocation || null
  )

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

  // ─────────────────────────────────────────────────────────────
  // 1. Initialize Google Maps via @googlemaps/js-api-loader
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true

    if (mapEngine === 'google') {
      if (!apiKey) {
        // No Google Maps API key configured in .env -> fallback to leaflet smoothly
        setGoogleError(
          isSinhala
            ? 'ගූගල් මැප්ස් API Key එකක් හමු නොවීය. ඕපන් ස්ට්‍රීට් මැප් ක්‍රියාත්මකයි.'
            : 'No Google Maps API Key found. Displaying interactive Sri Lanka map.'
        )
        setMapEngine('leaflet')
        return
      }

      const loader = new Loader({
        apiKey,
        version: 'weekly',
        libraries: ['places'],
      })

      loader
        .load()
        .then((google) => {
          if (!isMounted || !mapContainerRef.current) return

          // Clean previous leaflet map if any
          if (leafletMapRef.current) {
            leafletMapRef.current.remove()
            leafletMapRef.current = null
          }

          const defaultCenter = currentUserLoc || { lat: 6.9271, lng: 79.8612 }

          const map = new google.maps.Map(mapContainerRef.current, {
            center: defaultCenter,
            zoom: 9,
            mapTypeId: googleMapType === 'satellite' ? google.maps.MapTypeId.HYBRID : google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: true,
            zoomControlOptions: {
              position: google.maps.ControlPosition.RIGHT_BOTTOM,
            },
          })

          googleMapRef.current = map
          googleInfoWindowRef.current = new google.maps.InfoWindow()
          setGoogleLoaded(true)
          setGoogleError(null)

          // Click map to select location
          map.addListener('click', (e: any) => {
            if (!e.latLng) return
            const lat = e.latLng.lat()
            const lng = e.latLng.lng()
            setCurrentUserLoc({ lat, lng })
            const nearest = findNearestCity(lat, lng)
            const label = isSinhala
              ? `තෝරාගත් ස්ථානය: ${nearest.sinhala}`
              : `Selected: ${nearest.name}`
            setLocationStatus(label)
            if (onLocationFound) {
              onLocationFound({ lat, lng, city: nearest.name })
            }
          })
        })
        .catch((err) => {
          console.warn('Google Maps loading failed, falling back to Leaflet:', err)
          if (isMounted) {
            setGoogleError('Google Maps API authentication failed. Switched to OpenStreetMap.')
            setMapEngine('leaflet')
          }
        })
    }

    return () => {
      isMounted = false
    }
  }, [mapEngine, apiKey])

  // Change Google Map Type (Roadmap / Satellite)
  useEffect(() => {
    if (googleMapRef.current && window.google?.maps) {
      googleMapRef.current.setMapTypeId(
        googleMapType === 'satellite'
          ? window.google.maps.MapTypeId.HYBRID
          : window.google.maps.MapTypeId.ROADMAP
      )
    }
  }, [googleMapType])

  // ─────────────────────────────────────────────────────────────
  // 2. Initialize Leaflet Map (Fallback or Selected)
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true

    if (mapEngine === 'leaflet') {
      async function initLeaflet() {
        if (!mapContainerRef.current) return
        if (leafletMapRef.current) return

        const L = (await import('leaflet')).default

        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link')
          link.id = 'leaflet-css'
          link.rel = 'stylesheet'
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          document.head.appendChild(link)
        }

        if (!isMounted || !mapContainerRef.current) return

        const defaultCenter: [number, number] = currentUserLoc
          ? [currentUserLoc.lat, currentUserLoc.lng]
          : [6.9271, 79.8612]

        const map = L.map(mapContainerRef.current, {
          center: defaultCenter,
          zoom: 9,
          zoomControl: false,
        })

        L.control.zoom({ position: 'bottomright' }).addTo(map)

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 18,
        }).addTo(map)

        leafletMapRef.current = map

        map.on('click', (e: any) => {
          const { lat, lng } = e.latlng
          setCurrentUserLoc({ lat, lng })
          const nearest = findNearestCity(lat, lng)
          const label = isSinhala
            ? `තෝරාගත් ස්ථානය: ${nearest.sinhala}`
            : `Selected: ${nearest.name}`
          setLocationStatus(label)
          if (onLocationFound) {
            onLocationFound({ lat, lng, city: nearest.name })
          }
        })
      }

      initLeaflet()
    }

    return () => {
      isMounted = false
      if (leafletMapRef.current && mapEngine !== 'leaflet') {
        leafletMapRef.current.remove()
        leafletMapRef.current = null
      }
    }
  }, [mapEngine])

  // ─────────────────────────────────────────────────────────────
  // 3. Sync User Location Marker (Google & Leaflet)
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUserLoc) return

    // Update Google Maps User Marker
    if (mapEngine === 'google' && googleMapRef.current && window.google?.maps) {
      if (googleUserMarkerRef.current) {
        googleUserMarkerRef.current.setMap(null)
      }
      googleUserMarkerRef.current = new window.google.maps.Marker({
        position: currentUserLoc,
        map: googleMapRef.current,
        title: isSinhala ? 'ඔබ සිටින ස්ථානය' : 'Your Location',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: '#2563EB',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 3,
        },
      })
    }

    // Update Leaflet User Marker
    if (mapEngine === 'leaflet' && leafletMapRef.current) {
      import('leaflet').then((LModule) => {
        const L = LModule.default
        const map = leafletMapRef.current
        if (!map) return

        if (leafletUserMarkerRef.current) {
          leafletUserMarkerRef.current.remove()
        }

        const userIcon = L.divIcon({
          className: 'user-loc-dot',
          html: `
            <div style="
              width: 20px; height: 20px; background: #2563EB;
              border: 3px solid white; border-radius: 50%;
              box-shadow: 0 0 10px rgba(37,99,235,0.7);
            "></div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        })

        leafletUserMarkerRef.current = L.marker([currentUserLoc.lat, currentUserLoc.lng], {
          icon: userIcon,
          zIndexOffset: 1000,
        }).addTo(map)
      })
    }
  }, [currentUserLoc, mapEngine, isSinhala])

  // ─────────────────────────────────────────────────────────────
  // 4. Sync Worker Markers (Google & Leaflet)
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const validWorkers = workers.filter((w) => w.latitude && w.longitude)

    // Render Google Markers
    if (mapEngine === 'google' && googleMapRef.current && window.google?.maps) {
      googleMarkersRef.current.forEach((m) => m.setMap(null))
      googleMarkersRef.current = []

      validWorkers.forEach((worker) => {
        const skillName = getSkillLabel(worker.skill, isSinhala ? 'si' : 'en')
        const rateFormatted = formatCurrency(worker.dailyRate)

        let distanceKm: number | null = null
        if (currentUserLoc) {
          distanceKm = calculateDistance(
            currentUserLoc.lat,
            currentUserLoc.lng,
            worker.latitude,
            worker.longitude
          )
        }

        const isSelected = selectedWorkerId === worker.id || selectedWorkerId === worker.userId

        const marker = new window.google.maps.Marker({
          position: { lat: worker.latitude, lng: worker.longitude },
          map: googleMapRef.current,
          title: worker.user?.name,
          label: {
            text: rateFormatted,
            color: '#FFFFFF',
            fontSize: '11px',
            fontWeight: 'bold',
          },
          icon: {
            path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z',
            fillColor: isSelected ? '#1E40AF' : '#2563EB',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
            scale: 1.5,
            labelOrigin: new window.google.maps.Point(0, -32),
          },
        })

        const content = `
          <div style="font-family: sans-serif; min-width: 210px; padding: 6px;">
            <h4 style="margin: 0 0 2px; font-size: 14px; font-weight: bold; color: #0F172A;">
              ${worker.user?.name || 'Worker'}
            </h4>
            <p style="margin: 0 0 6px; font-size: 12px; color: #2563EB; font-weight: 600;">
              ${skillName}
            </p>
            <p style="margin: 0 0 4px; font-size: 11px; color: #64748B;">
              📍 ${worker.city || 'Sri Lanka'}, ${worker.state || ''}
            </p>
            ${
              distanceKm !== null
                ? `<p style="margin: 4px 0; color: #0284C7; font-weight: 600; font-size: 11px;">
                    ~${distanceKm.toFixed(1)} km ${isSinhala ? 'දුරින්' : 'away'}
                   </p>`
                : ''
            }
            <div style="display: flex; justify-content: space-between; align-items: center; margin: 8px 0; border-top: 1px solid #F1F5F9; padding-top: 6px;">
              <span style="font-size: 12px; color: #EAB308; font-weight: bold;">★ ${worker.rating?.toFixed(1) || '5.0'}</span>
              <span style="font-size: 13px; font-weight: bold; color: #0F172A;">${rateFormatted}/${isSinhala ? 'දිනකට' : 'day'}</span>
            </div>
            <div style="display: flex; gap: 6px; margin-top: 8px;">
              <a href="/workers/${worker.userId}" style="flex: 1; text-align: center; background: #2563EB; color: white; padding: 6px 10px; border-radius: 8px; font-size: 11px; font-weight: bold; text-decoration: none;">
                ${isSinhala ? 'පැතිකඩ බලන්න' : 'View Profile'}
              </a>
              <a href="https://www.google.com/maps/dir/?api=1&destination=${worker.latitude},${worker.longitude}" target="_blank" rel="noopener noreferrer" style="background: #F1F5F9; color: #334155; padding: 6px 8px; border-radius: 8px; font-size: 11px; text-decoration: none;">
                ↗
              </a>
            </div>
          </div>
        `

        marker.addListener('click', () => {
          if (googleInfoWindowRef.current) {
            googleInfoWindowRef.current.setContent(content)
            googleInfoWindowRef.current.open(googleMapRef.current, marker)
          }
        })

        googleMarkersRef.current.push(marker)
      })
    }

    // Render Leaflet Markers
    if (mapEngine === 'leaflet' && leafletMapRef.current) {
      import('leaflet').then((LModule) => {
        const L = LModule.default
        const map = leafletMapRef.current
        if (!map) return

        leafletMarkersRef.current.forEach((m) => m.remove())
        leafletMarkersRef.current = []

        validWorkers.forEach((worker) => {
          const skillName = getSkillLabel(worker.skill, isSinhala ? 'si' : 'en')
          const rateFormatted = formatCurrency(worker.dailyRate)

          let distanceKm: number | null = null
          if (currentUserLoc) {
            distanceKm = calculateDistance(
              currentUserLoc.lat,
              currentUserLoc.lng,
              worker.latitude,
              worker.longitude
            )
          }

          const isSelected = selectedWorkerId === worker.id || selectedWorkerId === worker.userId

          const workerIcon = L.divIcon({
            className: 'worker-map-marker',
            html: `
              <div style="
                background: ${isSelected ? '#1E40AF' : '#2563EB'};
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
              ">
                <span>${rateFormatted}</span>
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
              <h4 style="margin: 0; font-size: 14px; font-weight: bold; color: #0F172A;">
                ${worker.user?.name || 'Worker'}
              </h4>
              <p style="margin: 2px 0 6px; font-size: 12px; color: #2563EB; font-weight: 600;">
                ${skillName}
              </p>
              <p style="margin: 0 0 4px; font-size: 11px; color: #64748B;">
                📍 ${worker.city || 'Sri Lanka'}, ${worker.state || ''}
              </p>
              ${
                distanceKm !== null
                  ? `<p style="margin: 4px 0; color: #0284C7; font-weight: 600; font-size: 11px;">
                      ~${distanceKm.toFixed(1)} km ${isSinhala ? 'දුරින්' : 'away'}
                     </p>`
                  : ''
              }
              <div style="display: flex; justify-content: space-between; align-items: center; margin: 8px 0; border-top: 1px solid #F1F5F9; padding-top: 6px;">
                <span style="font-size: 12px; color: #EAB308; font-weight: bold;">★ ${worker.rating?.toFixed(1) || '5.0'}</span>
                <span style="font-size: 13px; font-weight: bold; color: #0F172A;">${rateFormatted}/${isSinhala ? 'දිනකට' : 'day'}</span>
              </div>
              <div style="display: flex; gap: 6px; margin-top: 8px;">
                <a href="/workers/${worker.userId}" style="flex: 1; text-align: center; background: #2563EB; color: white; padding: 6px 10px; border-radius: 8px; font-size: 11px; font-weight: bold; text-decoration: none;">
                  ${isSinhala ? 'පැතිකඩ බලන්න' : 'View Profile'}
                </a>
                <a href="https://www.google.com/maps/search/?api=1&query=${worker.latitude},${worker.longitude}" target="_blank" rel="noopener noreferrer" style="background: #F1F5F9; color: #334155; padding: 6px 8px; border-radius: 8px; font-size: 11px; text-decoration: none;" title="Open in Google Maps">
                  🗺️
                </a>
              </div>
            </div>
          `

          marker.bindPopup(popupHtml)
          leafletMarkersRef.current.push(marker)
        })
      })
    }
  }, [workers, selectedWorkerId, currentUserLoc, mapEngine, isSinhala])

  // ─────────────────────────────────────────────────────────────
  // 5. Geolocation ("Use My Location")
  // ─────────────────────────────────────────────────────────────
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert(isSinhala ? 'ඔබගේ බ්‍රවුසරය GPS පහසුකමට සහය නොදක්වයි.' : 'Geolocation is not supported by your browser.')
      return
    }

    setLocating(true)
    setLocationStatus(isSinhala ? 'ස්ථානය සොයමින් පවතී...' : 'Detecting your GPS location...')

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setCurrentUserLoc({ lat, lng })
        const nearest = findNearestCity(lat, lng)

        const msg = isSinhala
          ? `ඔබ අසල: ${nearest.sinhala} (~${pos.coords.accuracy.toFixed(0)}m නිරවද්‍යතාව)`
          : `Nearest: ${nearest.name} (~${pos.coords.accuracy.toFixed(0)}m accuracy)`
        setLocationStatus(msg)
        setLocating(false)

        if (onLocationFound) {
          onLocationFound({ lat, lng, city: nearest.name })
        }

        // Pan map to location
        if (mapEngine === 'google' && googleMapRef.current) {
          googleMapRef.current.panTo({ lat, lng })
          googleMapRef.current.setZoom(12)
        } else if (mapEngine === 'leaflet' && leafletMapRef.current) {
          leafletMapRef.current.flyTo([lat, lng], 12, { duration: 1.5 })
        }
      },
      (err) => {
        console.error('Geolocation error:', err)
        setLocationStatus(isSinhala ? 'GPS අවසර ලබාගත නොහැකි විය.' : 'GPS access denied or unavailable.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white">
      {/* Top Map Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: GPS & City Action */}
        <div className="pointer-events-auto flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={handleUseMyLocation}
            disabled={locating}
            className="bg-white/95 hover:bg-white text-gray-900 border border-gray-200/90 shadow-md backdrop-blur-md rounded-xl text-xs font-semibold gap-1.5 h-9 px-3.5 transition-all"
          >
            {locating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
            ) : (
              <Crosshair className="h-3.5 w-3.5 text-blue-600" />
            )}
            <span>{locating ? t('common.locating') : t('common.useMyLocation')}</span>
          </Button>

          {locationStatus && (
            <div className="hidden sm:flex items-center gap-1.5 bg-white/95 backdrop-blur-md border border-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-xl shadow-md">
              <MapPin className="h-3.5 w-3.5 text-green-600" />
              <span className="font-medium truncate max-w-[200px]">{locationStatus}</span>
            </div>
          )}
        </div>

        {/* Right: Map Engine & View Switcher */}
        <div className="pointer-events-auto flex items-center bg-white/95 backdrop-blur-md border border-gray-200/90 rounded-xl p-0.5 shadow-md text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMapEngine('google')
              setGoogleMapType('roadmap')
            }}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
              mapEngine === 'google' && googleMapType === 'roadmap'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MapIcon className="h-3 w-3" />
            <span>{t('common.googleMaps')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMapEngine('google')
              setGoogleMapType('satellite')
            }}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
              mapEngine === 'google' && googleMapType === 'satellite'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Globe className="h-3 w-3" />
            <span>{t('common.satellite')}</span>
          </button>

          <button
            type="button"
            onClick={() => setMapEngine('leaflet')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
              mapEngine === 'leaflet'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Compass className="h-3 w-3" />
            <span>OSM</span>
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-[460px] bg-gray-50 z-0"
      />

      {/* Bottom Info Bar */}
      <div className="p-3 bg-white border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-medium text-gray-700">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block animate-pulse" />
            {workers.length} {t('workers.availableCount')}
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-[11px] text-gray-400">
            {isSinhala ? 'සිතියම මත ක්ලික් කර ස්ථානය තෝරන්න' : 'Click anywhere on map to set your site location'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {currentUserLoc && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${currentUserLoc.lat},${currentUserLoc.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold"
            >
              <ExternalLink className="h-3 w-3" />
              <span>{t('common.openInGoogleMaps')}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
