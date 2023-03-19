import * as React from 'react'
import { nanoid } from 'nanoid'

type Marker = google.maps.Marker
type MarkerOptions = google.maps.MarkerOptions

export interface MarkerProps {
  map?: google.maps.Map | null
}

export interface UseMarker {
  addMarkers: (opts: MarkerOptions | MarkerOptions[]) => void
  removeMarkers: (id: string | string[]) => void
  markers: ReadonlyArray<MarkerObject>
}

export interface MarkerObject extends Marker {
  id: string
  currentPos?: google.maps.LatLngLiteral
}

const useMarkers = ({ map: gmap }: MarkerProps): UseMarker => {
  const [map, setMap] = React.useState<google.maps.Map | null>(null)
  const [markerObjs, setMarkerObjs] = React.useState<MarkerObject[]>([])

  const handlePositionChange = (id: string, currentPos?: google.maps.LatLngLiteral) => {
    if (!currentPos) return
    setMarkerObjs(
      (prev) =>
        [...prev.filter((mo) => mo.id !== id), { ...prev.find((mo) => mo.id === id), id, currentPos }] as MarkerObject[]
    )
  }

  const addMarkers = React.useCallback(
    (opt: MarkerOptions | MarkerOptions[]) => {
      if (!map) return
      const opts = [opt].flat()
      const ids = opts.map((_) => nanoid())
      const markers = opts.map((o, i) => {
        const marker = new google.maps.Marker({ map, ...o })
        marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
          handlePositionChange(ids[i], event.latLng?.toJSON())
        })
        return marker
      })
      const markerObjs = markers.map(
        (marker, i) =>
          ({
            id: ids[i],
            currentPos: marker.getPosition()?.toJSON(),
            ...marker,
          } as MarkerObject)
      )
      setMarkerObjs((prev) => [...prev, ...markerObjs])
    },
    [map]
  )

  const removeMarkers = React.useCallback(
    (id: string | string[]) => {
      if (!map) return
      const ids = [id].flat()
      setMarkerObjs((prev) => {
        prev.find((mo) => mo.id === id)?.setMap(null)
        return prev.filter((mo) => !ids.includes(mo.id))
      })
    },
    [map]
  )

  React.useEffect(() => {
    if (!gmap) return
    setMap(gmap)
  }, [gmap])

  React.useEffect(() => {
    return () => {
      setMarkerObjs([])
    }
  }, [])

  return { addMarkers, removeMarkers, markers: markerObjs }
}

export default useMarkers
