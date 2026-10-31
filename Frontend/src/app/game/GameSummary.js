"use client"
import { useRouter } from 'next/navigation'
import styles from "./page.module.css"

// Shown when the player chooses to end the game: totals up every round they played
export default function GameSummary({ roundScores, onPlayAgain }) {
    const router = useRouter()
    const roundsPlayed = roundScores.length
    const totalScore = roundScores.reduce((sum, score) => sum + score, 0)
    const averageScore = roundsPlayed > 0 ? Math.round(totalScore / roundsPlayed) : 0
    const bestScore = roundsPlayed > 0 ? Math.max(...roundScores) : 0

    return (
        <div id={styles.scoreScreen}>
            <img
                src="./logo.png"
                style={{ maxHeight: "60px", marginRight: "calc(100% - 70px)" }}
                alt="Logo"
            />
            <div id={styles.roundInformation}>Game over!</div>
            <div id={styles.scoreBar}>
                <div id={styles.score}>{totalScore}pts</div>
                <div id={styles.guessInfo}>
                    {roundsPlayed} {roundsPlayed === 1 ? "round" : "rounds"} played · Average: {averageScore}pts · Best round: {bestScore}pts
                </div>
                <div id={styles.scoreButtons}>
                    <button type="button" onClick={onPlayAgain}>Play again</button>
                    <button type="button" onClick={() => router.push('/lobby')}>Back to lobby</button>
                </div>
            </div>
        </div>
    )
}
