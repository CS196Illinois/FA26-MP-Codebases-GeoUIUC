"use client";
import "./googlebutton.css";

import { useState } from "react";
import { signInWithGoogle } from "./firebase-config";

// Firebase error codes for when the user closes or replaces the popup themselves
const CANCELLED_CODES = [
  "auth/popup-closed-by-user",
  "auth/cancelled-popup-request",
];

export default function LoginButton({ onLoginSuccess }) {
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    setErrorMessage("");
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed:", error);
      if (CANCELLED_CODES.includes(error?.code)) {
        setErrorMessage("Login was cancelled. Please try again.");
      } else if (error?.code === "auth/popup-blocked") {
        setErrorMessage(
          "Your browser blocked the login popup. Allow popups and try again.",
        );
      } else {
        setErrorMessage("Login failed. Please try again.");
      }
      return;
    }
    if (onLoginSuccess) onLoginSuccess();
  };

  return (
    <>
      <button
        type="button"
        className="login-with-google-btn"
        onClick={handleLogin}
      >
        Login with Google
      </button>
      {errorMessage && (
        <p className="login-error" role="alert">
          {errorMessage}
        </p>
      )}
    </>
  );
}
