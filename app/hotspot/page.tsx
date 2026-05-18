"use client"

import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import {
  MapPin,
  Compass,
  Heart,
  MessageSquareHeart,
  Merge,
  Users,
  Navigation,
  Loader2,
  Search,
  Filter,
  Bell,
  Settings,
  X,
  ChevronUp,
  ChevronDown,
  User,
  Star,
  Clock,
  TrendingUp
} from "lucide-react"
import "leaflet/dist/leaflet.css"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import TestNotificationButton from "@/components/TestNotificationButton"
import NotificationToggle from "@/components/NotificationToggle"
import NotificationDebug from "@/components/NotificationDebug"
import BottomNavigation from "@/components/BottomNavigation"
import { Badge } from "@/components/ui/badge"
interface Person {
  id: string
  name: string
  avatar: string
  lat: number
  lng: number
  status?: 'online' | 'away' | 'offline'
  lastSeen?: Date
  interests?: string[]
  rating?: number
  distance?: number
}

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const sinLat = Math.sin(dLat / 2)
  const sinLng = Math.sin(dLng / 2)
  const c = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng
  const d = 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c))
  return R * d
}

export default function HotspotPage() {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const leafletMap = useRef<any>(null)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const geoWatchId = useRef<number | null>(null)
  const [activeButton, setActiveButton] = useState<string | null>(null)
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDistance, setFilterDistance] = useState(5)
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'recent'>('distance')
  const [mapHeight, setMapHeight] = useState(400)
  const [isMapExpanded, setIsMapExpanded] = useState(false)

  const requestLocation = () => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation not supported on this device.")
      return
    }
    setLoading(true)
    // Clear previous watcher if any
    if (geoWatchId.current !== null) {
      navigator.geolocation.clearWatch(geoWatchId.current)
      geoWatchId.current = null
    }
    geoWatchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setLoading(false)
        setError(null)
        const { latitude, longitude, accuracy } = pos.coords
        setCoords({ lat: latitude, lng: longitude })
        setAccuracy(accuracy ?? null)
      },
      (err) => {
        setLoading(false)
        setError(err.message || "Unable to retrieve location.")
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }

  // Generate fake nearby people around current coords
  useEffect(() => {
    if (!coords) return
    const rnd = (min: number, max: number) => Math.random() * (max - min) + min
    const names = ["Emma", "Olivia", "Sophia", "Ava", "Mia", "Amelia", "Isabella", "Luna"]
    const avatars = [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&q=80",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&q=80",
      "https://images.unsplash.com/photo-1517849845537-1d51a20414de?w=96&q=80",
      "https://images.unsplash.com/photo-1516987723245-1bcda002c1d6?w=96&q=80",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&q=80",
    ]
    const generated: Person[] = Array.from({ length: 12 }).map((_, i) => ({
      id: `${Date.now()}-${i}`,
      name: names[i % names.length],
      avatar: avatars[i % avatars.length],
      lat: coords.lat + rnd(-0.01, 0.01),
      lng: coords.lng + rnd(-0.01, 0.01),
      status: ['online', 'away', 'offline'][i % 3] as 'online' | 'away' | 'offline',
      lastSeen: new Date(Date.now() - rnd(0, 3600000)),
      interests: ['Music', 'Travel', 'Food', 'Art', 'Sports', 'Tech'].slice(0, rnd(1, 4)),
      rating: Math.floor(rnd(3, 5))
    }))
    setPeople(generated)
  }, [coords])

  // Initialize Leaflet map dynamically without SSR
  useEffect(() => {
    let map: any
    let Lmod: any
    let userMarker: any

    (async () => {
      if (!mapRef.current) return
      if (leafletMap.current) return
      const L = await import("leaflet")
      Lmod = L
      // Default marker icon fix for Leaflet with Next
      // @ts-ignore
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
      })
      leafletMap.current = map

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 20,
          attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
        }
      ).addTo(map)

      const center = coords || { lat: 0, lng: 0 }
      map.setView([center.lat, center.lng], coords ? 16 : 2)

      if (coords) {
        userMarker = L.circleMarker([coords.lat, coords.lng], {
          radius: 8,
          color: "#ef4444",
          weight: 2,
          fillColor: "#ef4444",
          fillOpacity: 0.8,
        }).addTo(map)
      }
    })()

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove()
        leafletMap.current = null
      }
    }
  }, [])

  // Cleanup geolocation watcher on unmount
  useEffect(() => {
    return () => {
      if (geoWatchId.current !== null) {
        navigator.geolocation.clearWatch(geoWatchId.current)
        geoWatchId.current = null
      }
    }
  }, [])

  // Update map when coords, people, or accuracy change
  useEffect(() => {
    (async () => {
      if (!leafletMap.current) return
      const L = await import("leaflet")
      const map = leafletMap.current as any

      map.eachLayer((layer: any) => {
        if (layer instanceof L.CircleMarker) {
          map.removeLayer(layer)
        }
        if (layer instanceof L.Circle) {
          map.removeLayer(layer)
        }
        if (layer instanceof L.Marker && (layer as any).options?.pane !== "markerPane") {
          // keep default markers
        }
      })

      if (coords) {
        const you = L.circleMarker([coords.lat, coords.lng], {
          radius: 8,
          color: "#ef4444",
          weight: 2,
          fillColor: "#ef4444",
          fillOpacity: 0.8,
        }).addTo(map)
        if (accuracy) {
          L.circle([coords.lat, coords.lng], {
            radius: Math.max(accuracy, 20),
            color: "#ef4444",
            weight: 1,
            fillColor: "#ef4444",
            fillOpacity: 0.2,
          }).addTo(map)
        }
        map.setView([coords.lat, coords.lng], 16)
      }

      // Add people markers
      people.forEach((p) => {
        const m = L.marker([p.lat, p.lng])
        m.addTo(map).bindPopup(
          `<div style="display:flex;align-items:center;gap:8px;">
             <img src="${p.avatar}" alt="${p.name}" style="width:28px;height:28px;border-radius:9999px;object-fit:cover;"/>
             <div style="display:flex;flex-direction:column;">
               <strong>${p.name}</strong>
               <span style="font-size:12px;color:#6b7280;">${coords ? haversineKm(coords, p).toFixed(1) : "?"} km away</span>
             </div>
           </div>`
        )
      })
    })()
  }, [coords, people, accuracy])

  // Reverse geocode to get street/address when coordinates change
  useEffect(() => {
    if (!coords) {
      setAddress(null)
      return
    }
    const ctrl = new AbortController()
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}&zoom=18&addressdetails=1`
      ; (async () => {
        try {
          const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: "application/json" } })
          if (!res.ok) return
          const data: any = await res.json()
          const a = data?.address || {}
          const streetBase = a.road || a.pedestrian || a.footway || a.path || a.cycleway || a.residential
          const street = [streetBase, a.house_number].filter(Boolean).join(" ")
          const locality = a.city || a.town || a.village || a.suburb || a.neighbourhood
          const composed = [street || null, locality || null].filter(Boolean).join(", ")
          setAddress(composed || data?.display_name || null)
        } catch (_) {
          // ignore fetch aborts / network errors for UI
        }
      })()
    return () => ctrl.abort()
  }, [coords?.lat, coords?.lng])

  const sortedPeople = useMemo(() => {
    let filtered = people

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.interests?.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Apply distance filter
    if (coords) {
      filtered = filtered.filter(p => {
        const distance = haversineKm(coords, p)
        return distance <= filterDistance
      })
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      if (!coords) return 0

      switch (sortBy) {
        case 'distance':
          return haversineKm(coords, a) - haversineKm(coords, b)
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        case 'recent':
          return (b.lastSeen?.getTime() || 0) - (a.lastSeen?.getTime() || 0)
        default:
          return 0
      }
    })
  }, [people, coords, searchQuery, filterDistance, sortBy])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/50 sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 sm:p-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl sm:text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">Hotspot</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Discover people nearby</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={requestLocation}
                disabled={loading}
                size="sm"
                className="gap-1.5 sm:gap-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 px-3 sm:px-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                    <span className="hidden sm:inline">Locating...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Use my location</span>
                  </>
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="sm:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or interests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </header>

      {/* Filters Panel */}
      {showFilters && (
        <div className="max-w-2xl mx-auto px-4 py-3 sm:hidden">
          <Card className="border-0 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Max Distance</label>
                  <select
                    value={filterDistance}
                    onChange={(e) => setFilterDistance(Number(e.target.value))}
                    className="w-full p-2 bg-background border border-border/50 rounded-lg text-sm"
                  >
                    <option value={1}>1 km</option>
                    <option value={5}>5 km</option>
                    <option value={10}>10 km</option>
                    <option value={25}>25 km</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'distance' | 'rating' | 'recent')}
                    className="w-full p-2 bg-background border border-border/50 rounded-lg text-sm"
                  >
                    <option value="distance">Distance</option>
                    <option value="rating">Rating</option>
                    <option value="recent">Recently Active</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Map */}
      <div className="max-w-2xl mx-auto">
        <div className="px-4 mt-4">
          <div className="relative">
            <div
              ref={mapRef}
              className="w-full rounded-2xl overflow-hidden bg-gradient-to-br from-muted to-muted/50 border border-border/50 shadow-xl shadow-rose-500/5 relative group"
              style={{ height: isMapExpanded ? 'calc(100vh - 200px)' : `${mapHeight}px`, maxHeight: isMapExpanded ? 'none' : '500px' }}
            >
              {loading && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-rose-500 mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground">Loading map...</p>
                    <p className="text-xs text-muted-foreground">Getting your location</p>
                  </div>
                </div>
              )}
              {!coords && !loading && (
                <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-10">
                  <div className="text-center max-w-sm">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-rose-100 to-pink-100 dark:from-rose-900/20 dark:to-pink-900/20 flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-rose-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Map View</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Share your location to see nearby people on the map
                    </p>
                    <Button
                      onClick={requestLocation}
                      className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white border-0"
                    >
                      Enable Location
                    </Button>
                  </div>
                </div>
              )}

              {/* Map overlay controls */}
              <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-lg border border-border/50 shadow-lg p-1">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => {
                      if (leafletMap.current && coords) {
                        leafletMap.current.setView([coords.lat, coords.lng], 16)
                      }
                    }}
                    disabled={!coords}
                  >
                    <Navigation className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="h-8 w-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-lg border border-border/50 shadow-lg"
                  onClick={() => {
                    setIsMapExpanded(!isMapExpanded)
                    setMapHeight(isMapExpanded ? 400 : 600)
                  }}
                >
                  {isMapExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      {coords && sortedPeople.length > 0 && (
        <div className="max-w-2xl mx-auto px-4 mt-6 flex justify-center">
          <div className="animate-bounce cursor-pointer" onClick={() => {
            document.getElementById('people-details')?.scrollIntoView({ behavior: 'smooth' });
          }}>
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <ChevronDown className="w-5 h-5" />
              <span className="text-xs font-medium">Scroll to see people</span>
            </div>
          </div>
        </div>
      )}

      {/* Status */}
      <div className="max-w-2xl mx-auto px-4 mt-4">
        {loading && (
          <Card className="border-l-4 border-l-rose-500 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                <div>
                  <p className="font-medium text-rose-700 dark:text-rose-400 text-sm">Getting your location...</p>
                  <p className="text-xs text-muted-foreground">This will only take a moment</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {error && (
          <Card className="border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold">!</div>
                <div>
                  <p className="font-medium text-red-700 dark:text-red-400 text-sm">Location Error</p>
                  <p className="text-xs text-muted-foreground">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {!coords && !loading && !error && (
          <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <Navigation className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="font-medium text-blue-700 dark:text-blue-400 text-sm">Ready to discover</p>
                  <p className="text-xs text-muted-foreground">Tap "Use my location" to find nearby people</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {coords && !loading && !error && (
          <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center text-xs mt-1">✓</div>
                <div className="flex-1">
                  <p className="font-medium text-green-700 dark:text-green-400 text-sm mb-2">Location found</p>

                  {address && (
                    <div className="mb-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-green-200/50 dark:border-green-800/50">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-3 h-3 text-green-600 dark:text-green-400" />
                        <p className="text-xs font-medium text-foreground">Your Location</p>
                      </div>
                      <p className="text-xs text-foreground font-medium">{address}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-1">
                    <Badge variant="outline" className="text-xs bg-white/50 dark:bg-gray-800/50">
                      {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                    </Badge>
                    {accuracy && (
                      <Badge variant="outline" className="text-xs bg-white/50 dark:bg-gray-800/50">
                        ±{Math.round(accuracy)}m accuracy
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Nearby list */}
      <div id="people-details" className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">People Nearby</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {sortedPeople.length > 0 ? `${sortedPeople.length} people found` : 'No people nearby'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {sortedPeople.length > 0 && (
              <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 dark:from-blue-900/30 dark:to-cyan-900/30 dark:text-blue-400 text-xs">
                Active
              </Badge>
            )}
            <div className="hidden sm:flex gap-2">
              <select
                value={filterDistance}
                onChange={(e) => setFilterDistance(Number(e.target.value))}
                className="text-xs p-1.5 bg-background border border-border/50 rounded-lg"
              >
                <option value={1}>1 km</option>
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={25}>25 km</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'distance' | 'rating' | 'recent')}
                className="text-xs p-1.5 bg-background border border-border/50 rounded-lg"
              >
                <option value="distance">Distance</option>
                <option value="rating">Rating</option>
                <option value="recent">Recent</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          {sortedPeople.map((p) => {
            const distance = coords ? haversineKm(coords, p) : 0
            const isVeryClose = distance < 0.5
            const isClose = distance < 2
            const statusColor = p.status === 'online' ? 'bg-green-500' : p.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'

            return (
              <Card key={p.id} className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-white shadow-md">
                        <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div className={`absolute bottom-0 right-0 w-3 h-3 ${statusColor} rounded-full border-2 border-white`} />
                      {isVeryClose && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white animate-pulse" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate text-sm sm:text-base">{p.name}</h3>
                        {isVeryClose && <Badge variant="default" className="text-xs bg-green-500">Very close</Badge>}
                        {isClose && !isVeryClose && <Badge variant="secondary" className="text-xs">Nearby</Badge>}
                        {p.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs text-muted-foreground">{p.rating}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {coords ? `${distance.toFixed(2)} km away` : "Distance unknown"}
                        </div>
                        <span>•</span>
                        <span className="capitalize">{p.status || 'offline'}</span>
                      </div>

                      {p.interests && p.interests.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {p.interests.slice(0, 3).map((interest, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs bg-muted/50">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button
                      size="sm"
                      className="gap-1.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white border-0 shadow-md group-hover:shadow-lg transition-all duration-200 px-3"
                      onClick={() => setSelectedPerson(p)}
                    >
                      <MapPin className="w-3 h-3" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {sortedPeople.length === 0 && (
            <Card className="border-0 bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-700/50">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500 dark:text-gray-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">No people nearby yet</h3>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mb-4">
                  {coords
                    ? "There are no people in your immediate area. Try expanding your search radius or check back later."
                    : "Share your location to discover people nearby and start connecting."
                  }
                </p>
                {!coords && (
                  <Button
                    onClick={requestLocation}
                    className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white border-0"
                  >
                    Share Location
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Person Detail Modal */}
      {selectedPerson && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-background w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-border/50 shadow-xl animate-in slide-in-from-bottom duration-300">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Person Details</h3>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setSelectedPerson(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-lg">
                    <img src={selectedPerson.avatar} alt={selectedPerson.name} className="w-full h-full object-cover" />
                  </div>
                  <div className={`absolute bottom-0 right-0 w-4 h-4 ${selectedPerson.status === 'online' ? 'bg-green-500' : selectedPerson.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'} rounded-full border-2 border-white`} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-foreground">{selectedPerson.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="capitalize">{selectedPerson.status || 'offline'}</span>
                    {selectedPerson.rating && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span>{selectedPerson.rating}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {selectedPerson.interests && selectedPerson.interests.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-foreground mb-2">Interests</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedPerson.interests.map((interest, idx) => (
                      <Badge key={idx} variant="outline" className="bg-muted/50">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {coords ? `${haversineKm(coords, selectedPerson).toFixed(2)} km away` : "Distance unknown"}
                </div>
                {selectedPerson.lastSeen && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Clock className="w-4 h-4" />
                    Last seen {selectedPerson.lastSeen.toLocaleTimeString()}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white border-0">
                  <MessageSquareHeart className="w-4 h-4 mr-2" />
                  Message
                </Button>
                <Button variant="outline" className="flex-1">
                  <Heart className="w-4 h-4 mr-2" />
                  Like
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-background/95 via-background/80 to-transparent backdrop-blur-sm p-4 pb-safe">
        <div className="mx-auto max-w-md">
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl border border-border/50 shadow-xl shadow-rose-500/10">
            <div className="flex items-center justify-around p-2">
              <button
                onClick={() => setActiveButton('discover')}
                className={`relative flex flex-col items-center gap-1 px-3 py-2 sm:px-4 sm:py-3 rounded-xl transition-all duration-200 ${activeButton === 'discover'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
              >
                <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs font-medium">Discover</span>
                {activeButton === 'discover' && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
              </button>

              <button
                onClick={() => setActiveButton('likes')}
                className={`relative flex flex-col items-center gap-1 px-3 py-2 sm:px-4 sm:py-3 rounded-xl transition-all duration-200 ${activeButton === 'likes'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs font-medium">Likes</span>
                {activeButton === 'likes' && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
              </button>

              <button
                onClick={() => setActiveButton('messages')}
                className={`relative flex flex-col items-center gap-1 px-3 py-2 sm:px-4 sm:py-3 rounded-xl transition-all duration-200 ${activeButton === 'messages'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
              >
                <MessageSquareHeart className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs font-medium">Messages</span>
                {activeButton === 'messages' && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
              </button>

              <button
                onClick={() => setActiveButton('more')}
                className={`relative flex flex-col items-center gap-1 px-3 py-2 sm:px-4 sm:py-3 rounded-xl transition-all duration-200 ${activeButton === 'more'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
              >
                <Merge className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs font-medium">More</span>
                {activeButton === 'more' && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Notification Controls */}
      <div className="fixed bottom-20 right-4 flex flex-col gap-2 z-50">
        <NotificationDebug />
        <TestNotificationButton />
        <NotificationToggle />
      </div>

      <BottomNavigation />
    </div>
  )
}
