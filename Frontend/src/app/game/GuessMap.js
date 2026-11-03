
"use client"
import { GoogleMap } from "@react-google-maps/api"
import { useCallback, useEffect, useRef } from 'react'
import styles from "./page.module.css"

const MAP_CENTER = { lat: 40.108252, lng: -88.22699 }
const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" }

export default function GuessMap({
    isLoaded,
    userGuess,
    onMapClick,
    isExpanded,
    onToggleExpand,
    onSubmitGuess
}) {
    const mapInstanceRef = useRef(null)
    const { updateMarker } = useMapMarker(mapInstanceRef)
    const hasGuess = !isDefaultPosition(userGuess)

    const handleMapLoad = useCallback((map) => {
        mapInstanceRef.current = map
        map.setCenter(MAP_CENTER)
        map.setZoom(16)
    }, [])

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
            const transitionDuration = isExpanded ? 350 : 300
            const timeoutId = window.setTimeout(() => {
                window.google?.maps?.event?.trigger(mapInstanceRef.current, 'resize')
            }, transitionDuration)

            return () => window.clearTimeout(timeoutId)
        }
    }, [isExpanded])

    if (!isLoaded) {
        return (
            <div id={styles.guessOverlay}>
                <div className={styles.guessPanel}>
                    <p className={styles.guessPrompt}>Place your guess</p>
                    <p className={styles.guessStatus}>Loading map...</p>
                    <button className={styles.guessSubmit} type="button" disabled>
                        Select a location first
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div id={styles.guessOverlay}>
            <div className={`${styles.guessPanel} ${isExpanded ? styles.guessPanelExpanded : ""}`}>
                <div className={styles.guessPanelHeader}>
                    <div>
                        <p className={styles.guessPrompt}>Place your guess</p>
                        <p className={styles.guessStatus} aria-live="polite">
                            {hasGuess ? "Location selected" : "Select a campus location on the map"}
                        </p>
                    </div>
                    <button
                        className={styles.guessExpandButton}
                        type="button"
                        onClick={onToggleExpand}
                        aria-expanded={isExpanded}
                    >
                        {isExpanded ? "Collapse map" : "Expand map"}
                    </button>
                </div>
                <div className={styles.guessMapContainer}>
                    <GoogleMap
                        mapContainerStyle={MAP_CONTAINER_STYLE}
                        defaultCenter={MAP_CENTER}
                        defaultZoom={16}
                        onClick={handleMapClick}
                        onLoad={handleMapLoad}
                        onDblClick={onToggleExpand}
                        options={{
                            streetViewControl: false,
                            disableDoubleClickZoom: true,
                            disableDefaultUI: true
                        }}
                    />
                </div>
                <button
                    className={styles.guessSubmit}
                    type="button"
                    onClick={onSubmitGuess}
                    disabled={!hasGuess}
                >
                    {hasGuess ? "Submit guess" : "Select a location first"}
                </button>
            </div>
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
function createPosition(lat, lng) {
    return { lat, lng }
}

function isDefaultPosition(position) {
    return position?.lat === 0 && position?.lng === 0
}
