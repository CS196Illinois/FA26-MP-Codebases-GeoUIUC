// Difficulty levels. The lobby starts a game at /game?difficulty=<id>,
// and each level keeps its own high score at highScores.<id> in Firestore.
export const DIFFICULTIES = {
    easy: { label: "Easy", description: "2 min · can move", seconds: 120, canMove: true },
    medium: { label: "Medium", description: "1 min · can move", seconds: 60, canMove: true },
    hard: { label: "Hard", description: "30 sec · can move", seconds: 30, canMove: true },
    veryHard: { label: "Very Hard", description: "30 sec · look only", seconds: 30, canMove: false },
}

export const DIFFICULTY_IDS = Object.keys(DIFFICULTIES)
export const DEFAULT_DIFFICULTY = "easy"

// Falls back to the default for a missing or unknown id (e.g. /game?difficulty=banana)
export function getDifficultyId(id) {
    return Object.hasOwn(DIFFICULTIES, id) ? id : DEFAULT_DIFFICULTY
}

export function emptyHighScores() {
    return Object.fromEntries(DIFFICULTY_IDS.map(id => [id, 0]))
}

// Reads one level's high score from a user document's data. Accounts made before
// difficulties existed have a single `highScore`, which was earned on Easy settings.
export function getHighScore(userData, id) {
    const score = userData?.highScores?.[id]
    if (typeof score === "number") return score
    if (id === "easy" && typeof userData?.highScore === "number") return userData.highScore
    return 0
}
