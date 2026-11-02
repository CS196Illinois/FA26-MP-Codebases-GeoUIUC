import { test } from "node:test"
import assert from "node:assert/strict"
import { CAMPUS_PERIMETER, getPolygonBounds, getRandomPoint, isPointInPolygon } from "./test-scripts/randpoint.js"

const SQUARE = [0, 0, 1, 0, 1, 1, 0, 1, 0, 0]
// An L shape: the top-right corner (1-2, 1-2) is cut out
const L_SHAPE = [0, 0, 2, 0, 2, 1, 1, 1, 1, 2, 0, 2, 0, 0]

const at = (long, lat) => ({ long, lat })

test("isPointInPolygon: square", () => {
    assert.equal(isPointInPolygon(at(0.5, 0.5), SQUARE), true)
    assert.equal(isPointInPolygon(at(2, 2), SQUARE), false)
    assert.equal(isPointInPolygon(at(1.001, 0.5), SQUARE), false)
    assert.equal(isPointInPolygon(at(0.5, -0.001), SQUARE), false)
})

test("isPointInPolygon: concave L shape", () => {
    assert.equal(isPointInPolygon(at(0.5, 1.5), L_SHAPE), true)
    assert.equal(isPointInPolygon(at(1.5, 0.5), L_SHAPE), true)
    assert.equal(isPointInPolygon(at(1.5, 1.5), L_SHAPE), false)
})

test("isPointInPolygon accepts { lat, lng } too", () => {
    assert.equal(isPointInPolygon({ lng: 0.5, lat: 0.5 }, SQUARE), true)
    assert.equal(isPointInPolygon({ lng: 1.5, lat: 1.5 }, L_SHAPE), false)
})

test("getPolygonBounds", () => {
    assert.deepEqual(getPolygonBounds(L_SHAPE), { north: 2, south: 0, east: 2, west: 0 })
})

test("getRandomPoint always returns a point inside the polygon", () => {
    for (let i = 0; i < 1000; i++) {
        assert.equal(isPointInPolygon(getRandomPoint(L_SHAPE), L_SHAPE), true)
    }
})

test("getRandomPoint defaults to the whole campus and covers all of it", () => {
    const { north, south } = getPolygonBounds(CAMPUS_PERIMETER)
    const middle = (north + south) / 2
    let northHalf = 0
    let southHalf = 0
    for (let i = 0; i < 1000; i++) {
        const point = getRandomPoint()
        assert.equal(isPointInPolygon(point, CAMPUS_PERIMETER), true)
        if (point.lat > middle) northHalf++
        else southHalf++
    }
    assert.ok(northHalf > 100, `only ${northHalf} points in the north half`)
    assert.ok(southHalf > 100, `only ${southHalf} points in the south half`)
})
