/*  A polygon is a flat list of [long, lat, long, lat, ...] points (outlined on Google Earth), where the last point repeats the first.
CAMPUS_PERIMETER below is the polygon surrounding all of campus; the smaller sections of campus live in ../regions.js.

getRandomPoint(polygon) finds the rectangle that surrounds the polygon, repeatedly picks a random point (lat/long) inside that rectangle,
and then uses the even/odd rule to see if it is inside or outside of the polygon (essentially, draw a line from the point out past the edge of the polygon
and count how many times it crosses the polygon's edges; if that's an even number, then you're outside, but if it's odd you're inside)

If it is, then it returns that lat/long point, otherwise it tries again.

*/

export const CAMPUS_PERIMETER = [-88.22890608313011, 40.11628634808123, -88.22891244184002, 40.11034654381944, -88.23359201253385, 40.1102963974153, -88.23347059805408, 40.10542714838154, -88.23869368049655, 40.1054234572026, -88.24153454063733, 40.10537880417714, -88.24142112908335, 40.09442913338193, -88.23316532260186, 40.09449349111972, -88.22377233222194, 40.09457680061792, -88.21902433737426, 40.0945958373946, -88.21900309632787, 40.09082864149104, -88.21424489065865, 40.09094484330869, -88.21426804467058, 40.08855464696899, -88.20946518144682, 40.08851363540236, -88.2096394677189, 40.09837330686159, -88.21905997811407, 40.09820789899142, -88.21918599523089, 40.10425849262996, -88.21931193198679, 40.11091015340119, -88.21931973263258, 40.11295445208442, -88.22404263441631, 40.11281434241015, -88.22411159462452, 40.11634457296581, -88.22890608313011, 40.11628634808123]

const MAX_ATTEMPTS = 1000

function toLineSegments(polygon) {
    const lineSegments = []
    for (let i = 0; i < polygon.length - 2; i += 2) {
        lineSegments.push({ start: { long: polygon[i], lat: polygon[i + 1] }, end: { long: polygon[i + 2], lat: polygon[i + 3] } })
    }
    return lineSegments
}

export function getPolygonBounds(polygon) {
    const bounds = { north: -Infinity, south: Infinity, east: -Infinity, west: Infinity }
    for (let i = 0; i < polygon.length; i += 2) {
        bounds.west = Math.min(bounds.west, polygon[i])
        bounds.east = Math.max(bounds.east, polygon[i])
        bounds.south = Math.min(bounds.south, polygon[i + 1])
        bounds.north = Math.max(bounds.north, polygon[i + 1])
    }
    return bounds
}

// point is { lat, long } (or { lat, lng })
export function isPointInPolygon(point, polygon) {
    const long = point.long ?? point.lng
    const lat = point.lat
    //draw a horizontal line from the point out to the west and count how many edges it crosses
    let numIntersections = 0
    for (const { start, end } of toLineSegments(polygon)) {
        const crossesLatitude = (start.lat > lat) !== (end.lat > lat)
        if (!crossesLatitude) continue
        const crossingLong = start.long + (lat - start.lat) / (end.lat - start.lat) * (end.long - start.long)
        if (crossingLong < long) {
            numIntersections++
        }
    }
    return numIntersections % 2 == 1
}

export function getRandomPoint(polygon = CAMPUS_PERIMETER) {
    const bounds = getPolygonBounds(polygon)
    let randomPoint
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        randomPoint = {
            lat: (Math.random() * (bounds.north - bounds.south)) + bounds.south,
            long: (Math.random() * (bounds.east - bounds.west)) + bounds.west
        }
        if (isPointInPolygon(randomPoint, polygon)) {
            return randomPoint
        }
    }
    console.log("uh-oh :( couldn't find a point inside the polygon")
    return randomPoint
}

//when making the random point fit for consumption, please refer to https://xkcd.com/2170 :D
