// Tests for ../../firestore.rules against the local Firestore emulator.
// Run with: npm run test:rules  (needs Java; nothing is deployed)
import { readFileSync } from "node:fs";
import { after, before, beforeEach, test } from "node:test";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import { deleteDoc, doc, getDoc, increment, setDoc, updateDoc } from "firebase/firestore";

let testEnv;

const newPlayer = {
  email: "alice@illinois.edu",
  displayName: "Alice",
  profilePicture: "https://example.com/alice.png",
  highScores: { easy: 0, medium: 0, hard: 0, veryHard: 0 },
  totalPoints: 0,
  dailyStreak: 0,
  bio: "",
  recentScores: [0, 0, 0, 0, 0],
  userID: "alice",
  createdAt: new Date("2026-01-01"),
};

// Firestore as seen by a signed-in player, or by someone signed out
const as = (uid) => testEnv.authenticatedContext(uid).firestore();
const signedOut = () => testEnv.unauthenticatedContext().firestore();

async function seed(path, data) {
  await testEnv.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), path), data));
}

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "demo-geouiuc",
    firestore: { rules: readFileSync(new URL("../../firestore.rules", import.meta.url), "utf8") },
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

after(async () => {
  await testEnv.cleanup();
});

// --- Creating an account (src/app/login/page.js) ---

test("a new player can create their doc from the blank template", async () => {
  await assertSucceeds(setDoc(doc(as("alice"), "users/alice"), newPlayer));
});

test("a new player cannot start with points or high scores", async () => {
  const db = as("alice");
  await assertFails(setDoc(doc(db, "users/alice"), { ...newPlayer, totalPoints: 999999 }));
  await assertFails(
    setDoc(doc(db, "users/alice"), { ...newPlayer, highScores: { ...newPlayer.highScores, hard: 5000 } }),
  );
  await assertFails(setDoc(doc(db, "users/alice"), { ...newPlayer, dailyStreak: 50 }));
});

test("a player cannot create someone else's doc", async () => {
  await assertFails(setDoc(doc(as("alice"), "users/bob"), { ...newPlayer, userID: "bob" }));
});

// --- Playing (src/app/game/page.js) ---

test("a normal round saves points and a new high score", async () => {
  await seed("users/alice", newPlayer);
  await assertSucceeds(
    updateDoc(doc(as("alice"), "users/alice"), {
      totalPoints: increment(3200),
      "highScores.hard": 3200,
    }),
  );
});

test("a perfect round (5000) is allowed", async () => {
  await seed("users/alice", { ...newPlayer, totalPoints: 10000 });
  await assertSucceeds(
    updateDoc(doc(as("alice"), "users/alice"), {
      totalPoints: increment(5000),
      "highScores.veryHard": 5000,
    }),
  );
});

test("an old account without highScores can still save a score", async () => {
  const { highScores: _removed, ...oldAccount } = newPlayer;
  await seed("users/alice", { ...oldAccount, highScore: 2000, totalPoints: 8000 });
  await assertSucceeds(
    updateDoc(doc(as("alice"), "users/alice"), {
      totalPoints: increment(2500),
      "highScores.easy": 2500,
    }),
  );
});

test("high scores must be whole numbers from 0 to 5000", async () => {
  await seed("users/alice", newPlayer);
  const ref = doc(as("alice"), "users/alice");
  await assertFails(updateDoc(ref, { "highScores.easy": 999999 }));
  await assertFails(updateDoc(ref, { "highScores.easy": -1 }));
  await assertFails(updateDoc(ref, { "highScores.easy": "5000" }));
  await assertFails(updateDoc(ref, { "highScores.easy": 4999.5 }));
});

test("only the four real difficulties can have high scores", async () => {
  await seed("users/alice", newPlayer);
  await assertFails(updateDoc(doc(as("alice"), "users/alice"), { "highScores.godMode": 100 }));
});

test("totalPoints can't jump by more than one round", async () => {
  await seed("users/alice", newPlayer);
  await assertFails(updateDoc(doc(as("alice"), "users/alice"), { totalPoints: increment(5001) }));
});

test("totalPoints can't go down", async () => {
  await seed("users/alice", { ...newPlayer, totalPoints: 9000 });
  await assertFails(updateDoc(doc(as("alice"), "users/alice"), { totalPoints: 0 }));
});

test("the old single highScore and other stats can't be edited", async () => {
  await seed("users/alice", { ...newPlayer, highScore: 2000 });
  const ref = doc(as("alice"), "users/alice");
  await assertFails(updateDoc(ref, { highScore: 5000 }));
  await assertFails(updateDoc(ref, { dailyStreak: 365 }));
});

// --- Logging in again (src/app/login/page.js) ---

test("logging in again refreshes profile info without touching scores", async () => {
  await seed("users/alice", { ...newPlayer, totalPoints: 9000 });
  await assertSucceeds(
    updateDoc(doc(as("alice"), "users/alice"), {
      email: "alice@illinois.edu",
      displayName: "Alice S.",
      profilePicture: "https://example.com/new.png",
    }),
  );
});

// --- Other players and signed-out visitors ---

test("a player can't read or change someone else's doc", async () => {
  await seed("users/bob", { ...newPlayer, userID: "bob" });
  const db = as("alice");
  await assertFails(getDoc(doc(db, "users/bob")));
  await assertFails(updateDoc(doc(db, "users/bob"), { totalPoints: increment(100) }));
  await assertFails(deleteDoc(doc(db, "users/bob")));
});

test("signed-out visitors can't read or write anything", async () => {
  await seed("users/alice", newPlayer);
  const db = signedOut();
  await assertFails(getDoc(doc(db, "users/alice")));
  await assertFails(updateDoc(doc(db, "users/alice"), { totalPoints: increment(100) }));
});

test("a player can read and delete their own doc", async () => {
  await seed("users/alice", newPlayer);
  const db = as("alice");
  await assertSucceeds(getDoc(doc(db, "users/alice")));
  await assertSucceeds(deleteDoc(doc(db, "users/alice")));
});
