import assert from "node:assert/strict";
import { test } from "node:test";
import { buildUserWrite } from "./userDoc.js";

const user = {
  uid: "abc123",
  email: "player@illinois.edu",
  displayName: "Player One",
  photoURL: "https://example.com/photo.png",
  metadata: { creationTime: "Mon, 05 Oct 2026 12:00:00 GMT" },
};

test("first login creates the full document with zeroed stats", () => {
  const { isNew, data } = buildUserWrite(null, user);
  assert.equal(isNew, true);
  assert.equal(data.highScore, 0);
  assert.equal(data.totalPoints, 0);
  assert.equal(data.dailyStreak, 0);
  assert.equal(data.bio, "");
  assert.deepEqual(data.recentScores, [0, 0, 0, 0, 0]);
  assert.equal(data.userID, "abc123");
  assert.ok(data.createdAt instanceof Date);
});

test("returning login does not touch scores, streak or bio", () => {
  const existing = {
    highScore: 4200,
    totalPoints: 12000,
    dailyStreak: 3,
    bio: "hi",
  };
  const { isNew, data } = buildUserWrite(existing, user);
  assert.equal(isNew, false);
  for (const key of [
    "highScore",
    "totalPoints",
    "dailyStreak",
    "bio",
    "recentScores",
    "createdAt",
  ]) {
    assert.equal(
      key in data,
      false,
      `${key} should not be written for a returning player`,
    );
  }
});

test("returning login refreshes Google profile info", () => {
  const renamed = {
    ...user,
    displayName: "New Name",
    photoURL: "https://example.com/new.png",
  };
  const { data } = buildUserWrite({ displayName: "Player One" }, renamed);
  assert.deepEqual(data, {
    email: "player@illinois.edu",
    displayName: "New Name",
    profilePicture: "https://example.com/new.png",
  });
});
