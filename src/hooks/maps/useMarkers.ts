import * as React from 'react'

type Marker = google.maps.Marker

export interface MarkerOptions extends google.maps.MarkerOptions {
  title: string
}

export interface MarkerProps {
  map?: google.maps.Map | null
  onDragEnd?: (event: google.maps.MapMouseEvent) => void
  onClick?: (event: google.maps.MapMouseEvent) => void
}

export interface UseMarker {
  addMarkers: (opts: MarkerOptions | MarkerOptions[]) => void
  removeMarkers: (id: string | string[]) => void
  markers: ReadonlyArray<Marker>
  activeMarker: Readonly<Marker> | null
}

const useMarkers = ({ map: gmap, onDragEnd, onClick }: MarkerProps): UseMarker => {
  const [map, setMap] = React.useState<google.maps.Map | null>(null)
  const [markers, setMarkers] = React.useState<Marker[]>([])
  const [activeMarker, setActiveMarker] = React.useState<Marker | null>(null)

  const addMarkers = React.useCallback(
    (opt: MarkerOptions | MarkerOptions[]) => {
      if (!map) return
      const opts = [opt].flat()
      const markers = opts.map((o, i) => {
        const { title, ...options } = o
        const marker = new google.maps.Marker({ map, title, ...options })
        marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
          onDragEnd && onDragEnd(event)
        })
        marker.addListener('click', (event: google.maps.MapMouseEvent) => {
          setActiveMarker(markers.find((mo) => mo?.getTitle() === title) || null)
          onClick && onClick(event)
        })
        return marker
      })

      setMarkers((prev) => [...prev, ...markers])
    },
    // Do not recompute on onDrandEnd - this should not change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [map]
  )

  const removeMarkers = React.useCallback(
    (id: string | string[]) => {
      if (!map) return
      const ids = [id].flat()
      setMarkers((prev) => {
        prev.find((mo) => mo.getTitle() === id)?.setMap(null)
        return prev.filter((mo) => !ids.includes(mo.getTitle() as string))
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
      setMarkers((prev) => {
        prev.forEach((mo) => mo.unbindAll())
        return []
      })
      map && google.maps.event.clearInstanceListeners(map)
    }
  }, [map])

  return { addMarkers, removeMarkers, markers, activeMarker }
}

export default useMarkers
