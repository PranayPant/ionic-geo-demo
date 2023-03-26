import { IonPage, useIonViewWillEnter, IonContent, IonButton, useIonViewWillLeave } from '@ionic/react'
import { nanoid } from 'nanoid'
import * as React from 'react'
import { RedisGeoSearchResult, RedisGeoUnits } from '../../types/users'

import './Location.css'
import { AppContext } from '../../App'

import useMap from '../../hooks/maps/useMap'
import useMarkers from '../../hooks/maps/useMarkers'
import CustomInfoWindow from '../CustomInfoWindow'

const MEMBER_ID = '1234'
const RADIUS: number = 1000
const UNITS: RedisGeoUnits = 'mi'

const Location: React.FC = () => {
  const { coords } = React.useContext(AppContext)
  const [nearbyUsers, setNearbyUsers] = React.useState<RedisGeoSearchResult[] | null>(null)
  const [ws, setWs] = React.useState<WebSocket | null>(null)
  const mapRef = React.useRef<HTMLDivElement>(null)
  const [showInfoWindow, setShowInfoWindow] = React.useState<boolean>(false)
  const { map } = useMap({
    ref: mapRef,
    center: coords as google.maps.LatLngLiteral,
    bounds: nearbyUsers?.map((u) => ({
      lat: parseFloat(`${u.coordinates.latitude}`),
      lng: parseFloat(`${u.coordinates.longitude}`),
    })),
  })
  const { addMarkers, removeMarkers, markers, activeMarker } = useMarkers({
    map,
    onDragEnd: (event: google.maps.MapMouseEvent) => {
      ws?.send(
        JSON.stringify({
          id: nanoid(),
          type: 'changing-position',
          data: {
            longitude: event.latLng?.toJSON().lng,
            latitude: event.latLng?.toJSON().lat,
            member: MEMBER_ID,
            radius: RADIUS,
            radiusUnit: UNITS,
          },
        })
      )
    },
    onClick: () => setShowInfoWindow((prev) => !prev),
  })

  React.useEffect(() => {
    console.log('markers: ', markers)
  }, [markers])

  // Add user position and initialize search
  React.useEffect(() => {
    if (!coords || !addMarkers) return
    console.log('adding marker')
    addMarkers({
      title: MEMBER_ID,
      position: coords,
      draggable: true,
      clickable: true,
    })
  }, [coords, addMarkers])

  // Add markers for nearby users
  React.useEffect(() => {
    if (!nearbyUsers) return
    addMarkers(
      nearbyUsers
        .filter((u) => u.member !== MEMBER_ID)
        .map((u) => ({
          title: u.member,
          position: {
            lat: parseFloat(`${u.coordinates.latitude}`),
            lng: parseFloat(`${u.coordinates.longitude}`),
          },
          draggable: false,
          clickable: true,
        }))
    )
  }, [nearbyUsers, addMarkers])

  React.useEffect(() => {
    if (!map || !coords || !ws) return
    ws.send(
      JSON.stringify({
        id: nanoid(),
        type: 'ready-to-search',
        data: {
          longitude: coords.lng,
          latitude: coords.lat,
          member: MEMBER_ID,
          radius: RADIUS,
          radiusUnit: UNITS,
        },
      })
    )
  }, [ws, map, coords])

  useIonViewWillEnter(() => {
    const initializeMessaging = async () => {
      try {
        const ws = new WebSocket('ws://localhost:3001')
        ws.addEventListener('open', () => {
          console.log('Client open for connections')
        })
        ws.addEventListener('close', () => {
          console.log('Client has closed connection')
        })
        ws.addEventListener('error', (err) => {
          console.error('WebSocket connection error:', JSON.stringify(err))
        })
        ws.addEventListener('message', (message) => {
          const { type, data } = JSON.parse(message.data)
          switch (type) {
            case 'connect': {
              console.log('Server: connect -->', data)
              setWs(ws)
              break
            }
            case 'initialized-user': {
              console.log('Server: initialized-user -->', data)
              break
            }
            case 'nearby-users': {
              console.log(data)
              setNearbyUsers(data)
              break
            }
            case 'user-message': {
              console.log('Server: user-message -->', data)
              const payload = JSON.parse(data)
              const updatedUser: RedisGeoSearchResult = payload.data
              switch (payload.action) {
                case 'position-change': {
                  setNearbyUsers((prev) => {
                    const users = prev || []
                    return users.map((user) => {
                      if (user.member === updatedUser.member) {
                        return {
                          ...user,
                          coordinates: {
                            latitude: updatedUser.coordinates.latitude,
                            longitude: updatedUser.coordinates.longitude,
                          },
                        }
                      }
                      return user
                    })
                  })
                  break
                }
                default:
                  console.error('Invalid user message action', payload.action)
              }
              break
            }
            case 'error': {
              console.error('Server: Error -->', data)
              break
            }
            default:
              console.error('Received invalid message type:', type)
          }
        })
      } catch (err) {
        console.error('Error Initializing Location:', JSON.stringify(err))
      }
    }
    initializeMessaging()
  })
  useIonViewWillLeave(() => {
    ws?.close()
  })

  const handleSearch = () => {
    ws?.send(
      JSON.stringify({
        id: nanoid(),
        type: 'searching-positions',
        data: {
          member: MEMBER_ID,
          radius: RADIUS,
          radiusUnit: UNITS,
        },
      })
    )
  }

  return (
    <IonPage>
      <IonContent>
        <section className="flex-col center">
          {coords && (
            <>
              <div id="map-container" style={{ height: 400, width: 400 }} ref={mapRef} />
              <button style={{ padding: 10, margin: 10, borderRadius: 10 }} type="button" onClick={handleSearch}>
                Search nearby users
              </button>
              <CustomInfoWindow
                open={showInfoWindow}
                refEl={document.querySelector(`[aria-label="${activeMarker?.getTitle()}"]`)}
              />
            </>
          )}
        </section>
      </IonContent>
    </IonPage>
  )
}

export default Location
