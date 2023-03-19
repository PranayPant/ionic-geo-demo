import * as React from 'react'

export interface UseMap {
  map: google.maps.Map | null
}

export interface MapProps {
  ref: React.RefObject<HTMLElement>
  bounds?: (google.maps.LatLng | google.maps.LatLngLiteral)[]
  center: google.maps.LatLng | google.maps.LatLngLiteral
  zoom?: number
}

const useMap = ({ ref, bounds, center, zoom }: MapProps): UseMap => {
  const [map, setMap] = React.useState<google.maps.Map | null>(null)
  const [mapBounds, setMapBounds] = React.useState<google.maps.LatLngBounds | null>(new google.maps.LatLngBounds())
  React.useEffect(() => {
    if (!ref?.current) return
    const map = new google.maps.Map(ref.current, {
      center: center,
      zoom: zoom || 6,
    })
    setMap(map)
  }, [ref, center, zoom])
  React.useEffect(() => {
    if (!bounds || !mapBounds || !map) return
    bounds.forEach((b) => mapBounds.extend(b))
    map.fitBounds(mapBounds)
  }, [bounds, mapBounds, map])
  React.useEffect(() => {
    return () => {
      setMap(null)
      setMapBounds(null)
    }
  }, [])
  return { map }
}

export default useMap
