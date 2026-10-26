import { test } from "node:test"
import assert from "node:assert/strict"
import { isDrawable, pickPinImage } from "./pinImage.mjs"

const loaded = { complete: true, naturalWidth: 100 }
const broken = { complete: true, naturalWidth: 0 }
const loading = { complete: false, naturalWidth: 0 }

test("isDrawable is true only for an image that finished loading", () => {
    assert.equal(isDrawable(loaded), true)
    assert.equal(isDrawable(broken), false)
    assert.equal(isDrawable(loading), false)
    assert.equal(isDrawable(null), false)
    assert.equal(isDrawable(undefined), false)
})

test("pickPinImage prefers the profile picture when it loaded", () => {
    const fallback = { complete: true, naturalWidth: 50 }
    assert.equal(pickPinImage(loaded, fallback), loaded)
})

test("pickPinImage falls back when there is no profile picture", () => {
    assert.equal(pickPinImage(null, loaded), loaded)
    assert.equal(pickPinImage(broken, loaded), loaded)
    assert.equal(pickPinImage(loading, loaded), loaded)
})

test("pickPinImage returns null when nothing can be drawn", () => {
    assert.equal(pickPinImage(broken, broken), null)
    assert.equal(pickPinImage(null, null), null)
})
