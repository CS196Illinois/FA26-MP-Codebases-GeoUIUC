import { GoogleMap, MarkerF, PolylineF } from "@react-google-maps/api"
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPlayerIcon, FALLBACK_PLAYER_ICON } from './createPlayerIcon.mjs'
import styles from "./page.module.css"

const SCORE_BAR_COLORS = {
    background: "#3e5ab3",
    track: "#5b6369",
    fill: "#cd870e"
}
const MAX_ROUNDS = 3
const SCORE_BAR_CONFIG = {
    LINE_WIDTH: 50,
    LINE_Y: 35,
    LEFT_MARGIN: 0.1,
    RIGHT_MARGIN: 0.9,
    TICK_MULTIPLIER: 3,
    ACCELERATION: 0.01,
    WIDTH_RATIO: 0.8,
    OFFSET: 30
}
const MAX_SCORE = 5000

export default function ScoreScreen({
    show,
    score,
    guessInfo,
    goalPoint,
    guessPoint,
    isLoaded,
    onNextRound,
    onScoreBarComplete,
    currentRound
}) {
    const router = useRouter()
    const isGameComplete = currentRound > MAX_ROUNDS
    const scorebarRef = useScoreBarAnimation(show, score, onScoreBarComplete)
    const [userIconUrl, setUserIconUrl] = useState(FALLBACK_PLAYER_ICON)

    useEffect(() => {
        if (!show) return

        let active = true
        setUserIconUrl(FALLBACK_PLAYER_ICON)
        let profilePic = null
        try {
            profilePic = localStorage.getItem("profilePic")
        } catch {
            // Storage can be unavailable; the default icon still allows play.
        }
        createPlayerIcon(profilePic).then((url) => {
            if (active) setUserIconUrl(url)
        })

        return () => { active = false }
    }, [show])

    const handleButtonClick = useCallback(() => {
        if (isGameComplete) {
            router.push('/lobby')
        } else {
            onNextRound()
        }
    }, [isGameComplete, router, onNextRound])

    if (!show) {
        return (
            <div style={{ visibility: "hidden", display: "none" }}>
                <canvas
                    id={styles["fillScorebar"]}
                    height="10"
                    width="70"
                    ref={scorebarRef}
                />
            </div>
        )
    }

    const distance = guessPoint && !isDefaultPosition(guessPoint)
        ? calculateDistance(guessPoint.lat, guessPoint.lng, goalPoint.lat, goalPoint.lng)
        : 0

    const mapCenter = getMapCenter(goalPoint, guessPoint)
    const mapZoom = getMapZoom(distance)
    const userIcon = {
        url: userIconUrl,
        scaledSize: new google.maps.Size(50, 50)
    }
    const flagIcon = {
        url: "flag.png",
        scaledSize: new google.maps.Size(65, 50)
    }

    return (
        <div id={styles.scoreScreen}>
            <img
                src="./logo.png"
                style={{ maxHeight: "60px", marginRight: "calc(100% - 70px)" }}
                alt="Logo"
            />
            {isLoaded && goalPoint && (
                <GoogleMap
                    mapContainerStyle={{
                        width: '75vw',
                        height: '400px',
                        marginLeft: "12.5vw",
                        marginBottom: "10px"
                    }}
                    center={mapCenter}
                    zoom={mapZoom}
                    options={{
                        disableDefaultUI: true,
                        streetViewControl: false,
                        disableDoubleClickZoom: true
                    }}
                >
                    <MarkerF
                        position={goalPoint}
                        title="Correct Location"
                        icon={flagIcon}
                    />
                    {guessPoint && !isDefaultPosition(guessPoint) && (
                        <>
                            <MarkerF
                                position={guessPoint}
                                title="Your Guess"
                                icon={userIcon}
                            />
                            <PolylineF
                                path={[goalPoint, guessPoint]}
                                // geodesic={true}
                                options={{
                                    strokeColor: "#cc860e",
                                    strokeOpacity: 0.75,
                                    strokeWeight: 4,
                                }}
                            />
                        </>
                    )}
                </GoogleMap>
            )}
            <div id={styles["roundInformation"]}></div>
            <div id={styles["scoreBar"]}>
                <div id={styles["score"]}>{score}</div>
                <canvas
                    id={styles["fillScorebar"]}
                    height="70"
                    width={window.innerWidth}
                    ref={scorebarRef}
                />
                <div id={styles["guessInfo"]}>{guessInfo}</div>
                <button onClick={handleButtonClick}>
                    {isGameComplete ? "Game over - return to lobby" : "Start next!"}
                </button>
            </div>
        </div>
    )
}
function useScoreBarAnimation(show, score, onComplete) {
    const canvasRef = useRef(null)
    const [effectiveScore, setEffectiveScore] = useState(score)

    useEffect(() => {
        if (score && typeof score === 'string') {
            const scoreValue = parseInt(score.replace('pts', ''), 10) || 0
            setEffectiveScore(scoreValue)
        }
    }, [score])

    useEffect(() => {
        if (!show || !canvasRef.current) {
            if (!show && onComplete) onComplete()
            return
        }
        if (effectiveScore === 0) {
            if (onComplete) onComplete()
            return
        }

        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        const canvasWidth = window.innerWidth
        canvas.width = canvasWidth

        let fillTicks = 0
        let fillTicksAcc = 0
        let completed = false
        const { WIDTH_RATIO, TICK_MULTIPLIER, OFFSET, LINE_WIDTH, LINE_Y, LEFT_MARGIN, RIGHT_MARGIN, ACCELERATION } = SCORE_BAR_CONFIG
        const targetTicks = ((WIDTH_RATIO * canvasWidth) / TICK_MULTIPLIER) *
            (effectiveScore / MAX_SCORE) - 0
        const startX = LEFT_MARGIN * canvasWidth
        const endX = RIGHT_MARGIN * canvasWidth
        ctx.fillStyle = SCORE_BAR_COLORS.background
        ctx.fillRect(0, 0, canvasWidth, 50)

        ctx.beginPath()
        ctx.lineWidth = LINE_WIDTH
        ctx.strokeStyle = SCORE_BAR_COLORS.track
        ctx.lineCap = "round"
        ctx.moveTo(startX, LINE_Y)
        ctx.lineTo(endX, LINE_Y)
        ctx.stroke()
        const drawFrame = () => {
            if (fillTicks > targetTicks) {
                fillTicks = targetTicks
                if (!completed && onComplete) {
                    completed = true
                    onComplete()
                }
                return false
            }

            fillTicks += 1 + fillTicksAcc
            fillTicksAcc += ACCELERATION

            ctx.fillStyle = SCORE_BAR_COLORS.background
            ctx.fillRect(0, 0, canvasWidth, 50)

            ctx.beginPath()
            ctx.lineWidth = LINE_WIDTH
            ctx.strokeStyle = SCORE_BAR_COLORS.track
            ctx.lineCap = "round"
            ctx.moveTo(startX, LINE_Y)
            ctx.lineTo(endX, LINE_Y)
            ctx.stroke()

            ctx.beginPath()
            ctx.lineWidth = LINE_WIDTH
            ctx.strokeStyle = SCORE_BAR_COLORS.fill
            ctx.lineCap = "round"
            ctx.moveTo(startX, LINE_Y)
            ctx.lineTo(startX + (fillTicks * TICK_MULTIPLIER), LINE_Y)
            ctx.stroke()

            return true
        }

        const interval = setInterval(() => {
            if (!drawFrame()) {
                clearInterval(interval)
            }
        }, 1)

        return () => {
            clearInterval(interval)
            if (!completed && onComplete) onComplete()
        }
    }, [show, effectiveScore, onComplete])

    return canvasRef
}

function isDefaultPosition(position) {
    return position?.lat === 0 && position?.lng === 0
}
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function getMapCenter(goalPoint, guessPoint) {
    const hasValidGuess = guessPoint && !isDefaultPosition(guessPoint)
    if (!hasValidGuess) return goalPoint || MAP_CENTER

    return {
        lat: (goalPoint.lat + guessPoint.lat) / 2,
        lng: (goalPoint.lng + guessPoint.lng) / 2
    }
}
function getMapZoom(distance) {
    if (distance > 5) return 12
    if (distance > 1) return 14
    return 16
}
