import * as React from 'react'
import './styles.css'

export interface DirectionsMapProps {
  map: google.maps.Map | null
  travelMode?: google.maps.TravelMode
  origin: google.maps.LatLng
  destination: google.maps.LatLng
  onCloseDirections?: VoidFunction
}

const DirectionsMap: React.FC<DirectionsMapProps> = ({
  map,
  origin,
  destination,
  travelMode = google.maps.TravelMode.DRIVING,
  onCloseDirections,
}) => {
  const [service, setService] = React.useState<google.maps.DirectionsService | null>(null)
  const [renderer, setRenderer] = React.useState<google.maps.DirectionsRenderer | null>(null)
  const panelRef = React.useRef<HTMLDivElement | null>(null)
  const serviceRequest: google.maps.DirectionsRequest = React.useMemo(() => {
    return {
      origin,
      destination,
      travelMode,
    }
  }, [origin, destination, travelMode])
  const handleRoute = React.useCallback(
    (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
      if (status === 'OK') {
        renderer?.setDirections(result)
      }
    },
    [renderer]
  )
  React.useEffect(() => {
    if (!service) return
    service.route(serviceRequest, handleRoute)
  }, [service, serviceRequest, handleRoute])
  React.useEffect(() => {
    if (!map || !panelRef) return
    setService(new window.google.maps.DirectionsService())
    setRenderer(new window.google.maps.DirectionsRenderer({ map, panel: panelRef.current }))
  }, [map, panelRef])
  React.useEffect(() => {
    return () => {
      setRenderer(null)
      setService(null)
    }
  }, [])

  const handleCloseDirections = () => {
    renderer?.setMap(null)
    onCloseDirections && onCloseDirections()
  }

  return (
    <div className="directions-panel-container">
      <button className="close-btn" type="submit" onClick={handleCloseDirections}>
        X
      </button>
      <article ref={panelRef} className="directions-panel" />
    </div>
  )
}

export default DirectionsMap
