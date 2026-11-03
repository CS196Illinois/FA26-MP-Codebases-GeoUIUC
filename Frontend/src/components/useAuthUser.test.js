import { describe, expect, it, vi } from "vitest";

// Keep the test offline: no real Firebase app or Next.js router
vi.mock("./firebase-config", () => ({ auth: {} }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));

const { subscribeToAuthUser } = await import("./useAuthUser");

// Stand-in for onAuthStateChanged that lets the test decide when Firebase answers
function fakeListener() {
  let callback;
  const unsubscribe = vi.fn();
  const listen = (_auth, cb) => {
    callback = cb;
    return unsubscribe;
  };
  return { listen, unsubscribe, answer: (user) => callback(user) };
}

describe("subscribeToAuthUser", () => {
  it("does nothing until Firebase has restored the session", () => {
    const fake = fakeListener();
    const onUser = vi.fn();
    const onSignedOut = vi.fn();
    subscribeToAuthUser({}, { onUser, onSignedOut }, fake.listen);

    expect(onUser).not.toHaveBeenCalled();
    expect(onSignedOut).not.toHaveBeenCalled();
  });

  it("passes the signed-in user along", () => {
    const fake = fakeListener();
    const onUser = vi.fn();
    const onSignedOut = vi.fn();
    subscribeToAuthUser({}, { onUser, onSignedOut }, fake.listen);

    fake.answer({ uid: "abc123" });

    expect(onUser).toHaveBeenCalledWith({ uid: "abc123" });
    expect(onSignedOut).not.toHaveBeenCalled();
  });

  it("reports a signed-out visitor so the page can redirect", () => {
    const fake = fakeListener();
    const onUser = vi.fn();
    const onSignedOut = vi.fn();
    subscribeToAuthUser({}, { onUser, onSignedOut }, fake.listen);

    fake.answer(null);

    expect(onSignedOut).toHaveBeenCalledOnce();
    expect(onUser).not.toHaveBeenCalled();
  });

  it("returns Firebase's unsubscribe function for cleanup", () => {
    const fake = fakeListener();
    const stop = subscribeToAuthUser({}, { onUser: vi.fn(), onSignedOut: vi.fn() }, fake.listen);

    expect(stop).toBe(fake.unsubscribe);
  });
});
