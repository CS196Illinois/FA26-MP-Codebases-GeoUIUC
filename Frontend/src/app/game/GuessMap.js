
"use client"
import { useRef, useEffect, useCallback, useMemo } from 'react'
import { GoogleMap, PolygonF } from "@react-google-maps/api"
import styles from "./page.module.css"

export default function GuessMap({
    isLoaded,
    userGuess,
    onMapClick,
    isExpanded,
    onToggleExpand,
    onSubmitGuess,
    region
}) {
    const mapInstanceRef = useRef(null)
    const { updateMarker } = useMapMarker(mapInstanceRef)

    const mapContainerStyle = useMemo(() => ({
        width: isExpanded ? '600px' : '400px',
        height: isExpanded ? '600px' : '400px',
        marginLeft: "200px",
        marginBottom: "15px",
        transition: 'width 0.3s ease, height 0.3s ease'
    }), [isExpanded])

    const buttonStyle = useMemo(() => ({
        width: isExpanded ? '600px' : '400px',
        marginLeft: '200px',
        float: "right",
        transition: "0.3s ease"
    }), [isExpanded])

    const handleMapLoad = useCallback((map) => {
        mapInstanceRef.current = map
        map.setCenter(region.center)
        map.setZoom(region.zoom)
    }, [region])

    // The outline of the section being played, as Google Maps { lat, lng } points
    const regionOutline = useMemo(() => toLatLngPath(region.polygon), [region])

    const handleMapClick = useCallback((e) => {
        const position = createPosition(e.latLng.lat(), e.latLng.lng())
        updateMarker(position, true)
        onMapClick(position)
    }, [updateMarker, onMapClick])

    useEffect(() => {
        if (mapInstanceRef.current && userGuess) {
            updateMarker(userGuess, false)
        }
    }, [userGuess, updateMarker])

    useEffect(() => {
        if (mapInstanceRef.current) {
            setTimeout(() => {
                window.google?.maps?.event?.trigger(mapInstanceRef.current, 'resize')
            }, 50)
        }
    }, [isExpanded])

    if (!isLoaded) {
        return (
            <div id={styles["guessOverlay"]}>
                <div>Loading map...</div>
                <button onClick={onSubmitGuess}>Submit guess!</button>
            </div>
        )
    }

    return (
        <div id={styles["guessOverlay"]}>
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                defaultCenter={region.center}
                defaultZoom={region.zoom}
                onClick={handleMapClick}
                onLoad={handleMapLoad}
                onDblClick={onToggleExpand}
                options={{
                    streetViewControl: false,
                    disableDoubleClickZoom: true,
                    disableDefaultUI: true
                }}
            >
                <PolygonF
                    path={regionOutline}
                    options={{
                        strokeColor: "#cd870e",
                        strokeOpacity: 0.9,
                        strokeWeight: 2,
                        fillOpacity: 0,
                        clickable: false
                    }}
                />
            </GoogleMap>
            <button style={buttonStyle} onClick={onSubmitGuess}>
                Submit guess!
            </button>
        </div>
    )
}
function useMapMarker(mapInstanceRef) {
    const markerInstanceRef = useRef(null)

    const updateMarker = useCallback((position, shouldPan = true) => {
        if (!mapInstanceRef.current || !window.google?.maps) return

        if (markerInstanceRef.current) {
            markerInstanceRef.current.setMap(null)
            markerInstanceRef.current = null
        }

        if (position && !isDefaultPosition(position)) {
            markerInstanceRef.current = new window.google.maps.Marker({
                position,
                map: mapInstanceRef.current,
                title: 'Guess position',
                animation: window.google.maps.Animation.DROP
            })

            if (shouldPan) {
                mapInstanceRef.current.panTo(position)
                mapInstanceRef.current.setZoom(18)
            }
        }
    }, [mapInstanceRef])

    return { updateMarker }
}
function toLatLngPath(polygon) {
    const path = []
    for (let i = 0; i < polygon.length; i += 2) {
        path.push({ lat: polygon[i + 1], lng: polygon[i] })
    }
    return path
}

function createPosition(lat, lng) {
    return { lat, lng }
}

function isDefaultPosition(position) {
    return position?.lat === 0 && position?.lng === 0
}
