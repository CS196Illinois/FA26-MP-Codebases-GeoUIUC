import assert from "node:assert/strict";
import test from "node:test";
import { createPlayerIcon, FALLBACK_PLAYER_ICON } from "./createPlayerIcon.mjs";

const AVATAR_URL = "https://example.invalid/avatar.png";
const GENERATED_ICON = "data:image/png;base64,test-icon";

function fixture() {
  const draws = [];
  const image = { naturalWidth: 100, naturalHeight: 100 };
  const ctx = {
    beginPath() {},
    ellipse() {},
    closePath() {},
    fill() {},
    moveTo() {},
    bezierCurveTo() {},
    clip() {},
    drawImage(...args) {
      draws.push(args);
    },
  };
  const canvas = { getContext: () => ctx, toDataURL: () => GENERATED_ICON };
  const options = { createImage: () => image, createCanvas: () => canvas };
  return { image, ctx, canvas, draws, options };
}

test("missing and serialized-null URLs use the default without browser APIs", async () => {
  for (const url of [null, undefined, "", "   ", "null", "undefined"]) {
    assert.equal(await createPlayerIcon(url), FALLBACK_PLAYER_ICON);
  }
});

test("waits for loading before drawing and exports a personalized marker", async () => {
  const { image, draws, options } = fixture();
  const result = createPlayerIcon(AVATAR_URL, options);
  assert.equal(image.src, AVATAR_URL);
  assert.equal(image.crossOrigin, "anonymous");
  assert.equal(draws.length, 0);
  image.onload();
  assert.equal(await result, GENERATED_ICON);
  assert.deepEqual(draws[0], [image, 25, 25, 50, 50]);
  assert.equal(image.onload, null);
  assert.equal(image.onerror, null);
});

test("a failed request falls back without attempting to draw the broken image", async () => {
  const { image, draws, options } = fixture();
  const result = createPlayerIcon(AVATAR_URL, options);
  image.onerror();
  assert.equal(await result, FALLBACK_PLAYER_ICON);
  assert.equal(draws.length, 0);
});

test("a load event with zero dimensions does not draw a broken image", async () => {
  const { image, draws, options } = fixture();
  image.naturalWidth = 0;
  const result = createPlayerIcon(AVATAR_URL, options);
  image.onload();
  assert.equal(await result, FALLBACK_PLAYER_ICON);
  assert.equal(draws.length, 0);
});

test("a hanging request times out and ignores a late load event", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { image, draws, options } = fixture();
  const result = createPlayerIcon(AVATAR_URL, options);
  const lateLoad = image.onload;
  t.mock.timers.tick(5000);
  assert.equal(await result, FALLBACK_PLAYER_ICON);
  lateLoad();
  assert.equal(draws.length, 0);
});

test("a slow request can succeed before its timeout", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { image, draws, options } = fixture();
  const result = createPlayerIcon(AVATAR_URL, options);
  t.mock.timers.tick(4999);
  assert.equal(draws.length, 0);
  image.onload();
  t.mock.timers.tick(1);
  assert.equal(await result, GENERATED_ICON);
});

test("canvas drawing failures resolve to the default", async () => {
  const { image, ctx, options } = fixture();
  ctx.drawImage = () => {
    throw new Error("Broken image");
  };
  const result = createPlayerIcon(AVATAR_URL, options);
  image.onload();
  assert.equal(await result, FALLBACK_PLAYER_ICON);
});

test("a tainted canvas export resolves to the default", async () => {
  const { image, canvas, options } = fixture();
  canvas.toDataURL = () => {
    throw new Error("Canvas is tainted");
  };
  const result = createPlayerIcon(AVATAR_URL, options);
  image.onload();
  assert.equal(await result, FALLBACK_PLAYER_ICON);
});

test("a missing canvas context resolves to the default", async () => {
  const { image, canvas, draws, options } = fixture();
  canvas.getContext = () => null;
  const result = createPlayerIcon(AVATAR_URL, options);
  image.onload();
  assert.equal(await result, FALLBACK_PLAYER_ICON);
  assert.equal(draws.length, 0);
});

test("unavailable image APIs resolve to the default", async () => {
  const result = await createPlayerIcon(AVATAR_URL, {
    createImage: () => {
      throw new Error("Image unavailable");
    },
  });
  assert.equal(result, FALLBACK_PLAYER_ICON);
});
