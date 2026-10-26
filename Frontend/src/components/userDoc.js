// Decides what to write to users/{uid} when someone signs in.
// Kept free of Firebase calls so it can be tested with `npm test`.

// Full document for a player signing in for the first time
export function newUserData(user) {
  return {
    // Essential Auth data, directly from the user object
    email: user.email,
    displayName: user.displayName,
    profilePicture: user.photoURL,

    // Application-specific fields with default "blank" values
    highScore: 0,
    totalPoints: 0,
    dailyStreak: 0,
    bio: "",
    recentScores: [0, 0, 0, 0, 0],
    userID: user.uid,

    // Timestamps for metadata:
    createdAt: user.metadata?.creationTime
      ? new Date(user.metadata.creationTime)
      : null,
  };
}

// existingData is the current document's data, or null if there is none yet.
// New players get the full template. Returning players only get their Google
// profile info refreshed, so scores, streak and bio are left alone.
export function buildUserWrite(existingData, user) {
  if (!existingData) {
    return { isNew: true, data: newUserData(user) };
  }
  return {
    isNew: false,
    data: {
      email: user.email,
      displayName: user.displayName,
      profilePicture: user.photoURL,
    },
  };
}
