// Run with: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DIFFICULTIES,
  DIFFICULTY_IDS,
  emptyHighScores,
  getDifficultyId,
  getHighScore,
} from "../src/app/game/difficulty.js";

test("each difficulty has the agreed timer and movement", () => {
  assert.deepEqual(
    DIFFICULTY_IDS.map((id) => [id, DIFFICULTIES[id].seconds, DIFFICULTIES[id].canMove]),
    [
      ["easy", 120, true],
      ["medium", 60, true],
      ["hard", 30, true],
      ["veryHard", 30, false],
    ],
  );
});

test("missing or unknown difficulty falls back to easy", () => {
  assert.equal(getDifficultyId("hard"), "hard");
  assert.equal(getDifficultyId(null), "easy");
  assert.equal(getDifficultyId("banana"), "easy");
  assert.equal(getDifficultyId("toString"), "easy");
});

test("new players start with a 0 high score on every level", () => {
  assert.deepEqual(emptyHighScores(), { easy: 0, medium: 0, hard: 0, veryHard: 0 });
});

test("getHighScore reads per-level scores", () => {
  const data = { highScores: { easy: 100, hard: 4200 } };
  assert.equal(getHighScore(data, "easy"), 100);
  assert.equal(getHighScore(data, "hard"), 4200);
  assert.equal(getHighScore(data, "medium"), 0);
  assert.equal(getHighScore(undefined, "easy"), 0);
});

test("an old single highScore counts as the Easy high score", () => {
  const oldAccount = { highScore: 3100 };
  assert.equal(getHighScore(oldAccount, "easy"), 3100);
  assert.equal(getHighScore(oldAccount, "veryHard"), 0);
  assert.equal(getHighScore({ highScore: 3100, highScores: { easy: 3500 } }, "easy"), 3500);
});
