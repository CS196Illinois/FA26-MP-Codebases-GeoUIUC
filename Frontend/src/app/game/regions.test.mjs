import { test } from "node:test"
import assert from "node:assert/strict"
import { CAMPUS_PERIMETER, getRandomPoint, isPointInPolygon } from "./test-scripts/randpoint.js"
import {
    DEFAULT_REGION_ID,
    REGIONS,
    findPanoramaInRegion,
    resolveRegion,
    resolveRegionId,
    shouldAcceptPanorama
} from "./regions.js"
import { MAX_SCORE, calculateScore } from "./scoring.js"

const regionEntries = Object.entries(REGIONS)

// Approximate locations of campus landmarks, used to check the sections are drawn in the right place
const LANDMARKS = [
    { name: "Grainger Engineering Library", lat: 40.1125, lng: -88.2269, region: "north" },
    { name: "Siebel Center for CS", lat: 40.1138, lng: -88.2249, region: "north" },
    { name: "Illini Union", lat: 40.1092, lng: -88.2272, region: "central" },
    { name: "Foellinger Auditorium", lat: 40.1059, lng: -88.2272, region: "central" },
    { name: "Krannert Center", lat: 40.1080, lng: -88.2225, region: "central" },
    { name: "ACES Library", lat: 40.1027, lng: -88.2252, region: "south" },
    { name: "Arboretum", lat: 40.0930, lng: -88.2160, region: "south" },
    { name: "Memorial Stadium", lat: 40.0992, lng: -88.2360, region: "west" },
    { name: "State Farm Center", lat: 40.0962, lng: -88.2359, region: "west" }
]

// A fake google.maps.StreetViewService.getPanorama result
function fakePanorama(lat, lng, copyright = "© 2025 Google") {
    return { copyright, location: { pano: "fake", latLng: { lat: () => lat, lng: () => lng } } }
}

test("every region is well formed", () => {
    for (const [id, region] of regionEntries) {
        assert.equal(typeof region.name, "string", id)
        assert.ok(region.polygon.length >= 8 && region.polygon.length % 2 === 0, `${id} needs at least 3 points plus the closing point`)
        const last = region.polygon.length
        assert.deepEqual(region.polygon.slice(0, 2), region.polygon.slice(last - 2), `${id} polygon must end where it starts`)
        assert.ok(region.zoom > 0, id)
        assert.ok(region.maxDistance > 0, id)
        assert.equal(isPointInPolygon(region.center, region.polygon), true, `${id} center is outside its polygon`)
    }
})

test("the whole-campus region is the original campus perimeter", () => {
    assert.equal(REGIONS[DEFAULT_REGION_ID].polygon, CAMPUS_PERIMETER)
})

// Checking only the corners isn't enough: campus is concave, so an edge between two on-campus corners can still cut across the campus border.
// This checks 100 evenly spaced points along every edge of every section.
test("every section is inside the campus perimeter, edges included", () => {
    for (const [id, region] of regionEntries) {
        if (id === DEFAULT_REGION_ID) continue
        const p = region.polygon
        for (let i = 0; i < p.length - 2; i += 2) {
            for (let step = 0; step <= 100; step++) {
                const t = step / 100
                const point = { long: p[i] + t * (p[i + 2] - p[i]), lat: p[i + 1] + t * (p[i + 3] - p[i + 1]) }
                assert.equal(
                    isPointInPolygon(point, CAMPUS_PERIMETER), true,
                    `${id} edge (${p[i]}, ${p[i + 1]}) -> (${p[i + 2]}, ${p[i + 3]}) leaves campus near ${point.long}, ${point.lat}`
                )
            }
        }
    }
})

test("random points in each section are on campus", () => {
    for (const [id, region] of regionEntries) {
        for (let i = 0; i < 20000; i++) {
            const point = getRandomPoint(region.polygon)
            assert.equal(isPointInPolygon(point, CAMPUS_PERIMETER), true, `${id} produced off-campus point ${point.long}, ${point.lat}`)
        }
    }
})

test("landmarks are in the right section and only that section", () => {
    for (const landmark of LANDMARKS) {
        for (const [id, region] of regionEntries) {
            if (id === DEFAULT_REGION_ID) continue
            const expected = id === landmark.region
            assert.equal(isPointInPolygon(landmark, region.polygon), expected, `${landmark.name} ${expected ? "should" : "should not"} be in ${id}`)
        }
        assert.equal(isPointInPolygon(landmark, CAMPUS_PERIMETER), true, `${landmark.name} should be on campus`)
    }
})

test("random points stay inside each region", () => {
    for (const [id, region] of regionEntries) {
        for (let i = 0; i < 1000; i++) {
            assert.equal(isPointInPolygon(getRandomPoint(region.polygon), region.polygon), true, id)
        }
    }
})

test("resolveRegionId falls back to the whole campus", () => {
    assert.equal(resolveRegionId("north"), "north")
    assert.equal(resolveRegion("north"), REGIONS.north)
    for (const bad of [null, undefined, "", "asdf", "toString", "__proto__"]) {
        assert.equal(resolveRegionId(bad), DEFAULT_REGION_ID, String(bad))
    }
})

test("shouldAcceptPanorama checks the imagery source and location", () => {
    const north = REGIONS.north
    assert.equal(shouldAcceptPanorama(fakePanorama(40.1125, -88.2269), north), true)
    // Google imagery, but on the Main Quad: this is what a 1000m search radius used to return
    assert.equal(shouldAcceptPanorama(fakePanorama(40.1059, -88.2272), north), false)
    assert.equal(shouldAcceptPanorama(fakePanorama(40.1125, -88.2269, "© Some User"), north), false)
    assert.equal(shouldAcceptPanorama(undefined, north), false)
})

test("findPanoramaInRegion returns the first acceptable panorama", async () => {
    const region = REGIONS.central
    let calls = 0
    const service = {
        getPanorama: async ({ location, radius }) => {
            calls++
            assert.ok(radius <= 100)
            if (calls === 1) throw new Error("ZERO_RESULTS")
            if (calls === 2) return { data: fakePanorama(40.1125, -88.2269) } // outside the region
            return { data: fakePanorama(location.lat, location.lng) }
        }
    }
    const data = await findPanoramaInRegion(service, region)
    assert.equal(calls, 3)
    assert.equal(shouldAcceptPanorama(data, region), true)
})

test("findPanoramaInRegion gives up after maxAttempts", async () => {
    let calls = 0
    const service = { getPanorama: async () => { calls++; throw new Error("ZERO_RESULTS") } }
    assert.equal(await findPanoramaInRegion(service, REGIONS.north, 10), null)
    assert.equal(calls, 10)
})

test("calculateScore", () => {
    const { all, north } = REGIONS
    assert.equal(calculateScore(0, north.maxDistance), MAX_SCORE)
    assert.equal(calculateScore(north.maxDistance, north.maxDistance), 0)
    assert.equal(calculateScore(north.maxDistance * 2, north.maxDistance), 0)
    // a 300m miss is worth less in a small section than on the whole campus
    assert.ok(calculateScore(0.3, north.maxDistance) < calculateScore(0.3, all.maxDistance))
})

test("whole-campus scores are unchanged", () => {
    // Values from the original page.js calculateScore, before sections were added
    assert.equal(calculateScore(0.3, REGIONS.all.maxDistance), 4639)
    assert.equal(calculateScore(1, REGIONS.all.maxDistance), 3796)
    assert.equal(calculateScore(3, REGIONS.all.maxDistance), 1390)
})
