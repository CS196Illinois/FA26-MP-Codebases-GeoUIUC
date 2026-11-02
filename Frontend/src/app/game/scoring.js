export const MAX_SCORE = 5000

// Distance in km between two lat/lng points (Haversine formula)
export function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// maxDistance is the distance (km) that scores 0 points, usually the size of the section being played
export function calculateScore(distance, maxDistance) {
    const normalizedDistance = distance / maxDistance
    return Math.max(0, Math.floor(MAX_SCORE * (1 - normalizedDistance)))
}
