/*  The sections of campus a player can choose to play on.

Each polygon is a flat list of [long, lat, long, lat, ...] points where the last point repeats the first,
the same format as CAMPUS_PERIMETER in ./test-scripts/randpoint.js. Every section must sit inside CAMPUS_PERIMETER,
so its points are pulled in slightly from the campus edge. To add a section, outline it on Google Earth, copy the
points in here, and run `npm test` to check it.

center/zoom are where the guess map starts. maxDistance (km) is the miss distance that scores 0 points.
*/

import { calculateDistance } from "./scoring.js"
import { CAMPUS_PERIMETER, getPolygonBounds, getRandomPoint, isPointInPolygon } from "./test-scripts/randpoint.js"

// The original whole-campus scoring bounds, kept so whole-campus scores don't change
const CAMPUS_MAP_BOUNDS = {
    north: 40.1161,
    south: 40.0884,
    east: -88.2095,
    west: -88.2423
}

function diagonalDistance(bounds) {
    return calculateDistance(bounds.south, bounds.west, bounds.north, bounds.east)
}

function createRegion(name, polygon, center, zoom, bounds = getPolygonBounds(polygon)) {
    return { name, polygon, center, zoom, maxDistance: diagonalDistance(bounds) }
}

export const DEFAULT_REGION_ID = "all"

export const REGIONS = {
    all: createRegion(
        "Whole Campus",
        CAMPUS_PERIMETER,
        { lat: 40.108252, lng: -88.22699 },
        16,
        CAMPUS_MAP_BOUNDS
    ),
    // North of Green St, east of Wright St: Engineering Quad, Grainger, Siebel
    north: createRegion(
        "North Campus (Engineering)",
        [-88.22885, 40.11625, -88.22885, 40.11045, -88.21937, 40.11045, -88.21937, 40.11290, -88.22409, 40.11276, -88.22416, 40.11629, -88.22885, 40.11625],
        { lat: 40.1135, lng: -88.2262 },
        17
    ),
    // Green St down to Gregory Dr, Wright St to Lincoln Ave: Main Quad, Illini Union, Krannert Center
    central: createRegion(
        "Main Quad",
        [-88.22885, 40.11040, -88.22885, 40.10360, -88.21925, 40.10360, -88.21936, 40.11040, -88.22885, 40.11040],
        { lat: 40.1070, lng: -88.2245 },
        17
    ),
    // West of Wright St: Campustown, ARC, Memorial Stadium, State Farm Center
    west: createRegion(
        "Campustown & Stadium",
        [-88.22895, 40.11025, -88.23352, 40.11025, -88.23341, 40.10537, -88.24147, 40.10532, -88.24137, 40.09449, -88.22895, 40.09462, -88.22895, 40.11025],
        { lat: 40.1000, lng: -88.2350 },
        16
    ),
    // South of Gregory Dr, east of Wright St: South Quad, ACES, Florida Ave halls, Arboretum
    south: createRegion(
        "South Campus & Arboretum",
        [-88.22885, 40.10355, -88.21925, 40.10355, -88.21912, 40.09815, -88.20969, 40.09831, -88.20952, 40.08857, -88.21421, 40.08861, -88.21421, 40.09100, -88.21894, 40.09089, -88.21896, 40.09466, -88.22885, 40.09462, -88.22885, 40.10355],
        { lat: 40.0985, lng: -88.2230 },
        16
    )
}

// Turns a ?region= value into a region, falling back to the whole campus for missing or unknown ids
export function resolveRegionId(id) {
    return Object.hasOwn(REGIONS, id) ? id : DEFAULT_REGION_ID
}

export function resolveRegion(id) {
    return REGIONS[resolveRegionId(id)]
}

// A Street View result is usable if it is Google's own imagery and it is inside the region
export function shouldAcceptPanorama(data, region) {
    const isGoogleStreetView = data?.copyright?.indexOf("Google") >= 0
    if (!isGoogleStreetView || !data.location?.latLng) return false

    const latLng = data.location.latLng
    return isPointInPolygon({ lat: latLng.lat(), lng: latLng.lng() }, region.polygon)
}

// Search radius in meters around each random point. Kept small so Google can't snap to imagery outside the region.
export const PANORAMA_SEARCH_RADIUS = 100
export const MAX_PANORAMA_ATTEMPTS = 50

// service is a google.maps.StreetViewService (or anything with the same getPanorama).
// Returns the Street View data for a random spot in the region, or null if none was found.
export async function findPanoramaInRegion(service, region, maxAttempts = MAX_PANORAMA_ATTEMPTS) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const randomPoint = getRandomPoint(region.polygon)
        const location = { lat: randomPoint.lat, lng: randomPoint.long }
        try {
            const { data } = await service.getPanorama({ location, radius: PANORAMA_SEARCH_RADIUS })
            if (shouldAcceptPanorama(data, region)) return data
        } catch {
            // no Street View within PANORAMA_SEARCH_RADIUS of this point; try another one
        }
    }
    return null
}
