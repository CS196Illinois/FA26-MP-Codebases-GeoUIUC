"use client";

import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import signInWithGoogle  from "@/components/firebase-config";
import { auth, db } from "@/components/firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import { useState, useRef, useEffect } from "react";
import { doc, getDoc } from 'firebase/firestore'
import { DIFFICULTIES, DIFFICULTY_IDS, getHighScore } from "@/app/game/difficulty";

// "Start Game!" swaps itself for the four difficulty choices
function StartButton() {
  const router = useRouter();
  const [choosing, setChoosing] = useState(false);

  if (!choosing) {
    return (
      <button
        className={styles.startButton}
        onClick={() => setChoosing(true)}
      >
        <div className={styles.buttonText}>Start Game!</div>
      </button>
    );
  }

  return (
    <div className={styles.difficultyChooser}>
      <div className={styles.difficultyGrid}>
        {DIFFICULTY_IDS.map((id) => (
          <button
            key={id}
            type="button"
            className={styles.difficultyButton}
            onClick={() => router.push(`/game?difficulty=${id}`)}
          >
            <div className={styles.buttonText}>{DIFFICULTIES[id].label}</div>
            <div className={styles.difficultyDetail}>{DIFFICULTIES[id].description}</div>
          </button>
        ))}
      </div>
      <button type="button" className={styles.backButton} onClick={() => setChoosing(false)}>
        Back
      </button>
    </div>
  );
}

// Move videos array outside component so it doesn't recreate on every render
const videos = [
  "/BGvideo1.mp4",
  "/BGvideo2.mp4",
  "/BGvideo3.mp4",
  "/BGvideo4.mp4",
  "/BGvideo5.mp4",
  "/BGvideo6.mp4",
  "/BGvideo7.mp4",
  "/BGvideo8.mp4",
  "/BGvideo9.mp4",
];


export default function Lobby() {
  const [profilePic, setProfilePic] = useState();
  const router = useRouter();
  const handleLoginSuccess = () => router.push("/lobby");
  const [docSnap, setDocSnap] = useState();
  
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState(true);
  const videoARef = useRef(null);
  const videoBRef = useRef(null);
  const [name, setName] = useState("");

  useEffect(() => {
    // Auth guard: if not signed in, redirect back to /login.
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        try { router.replace("/login"); } catch {}
      }
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("name");
      if (storedName) setName(storedName);
    }
  }, []);
  useEffect(() => {
      setProfilePic(localStorage.getItem("profilePic"));
    }, []);

  useEffect(() => {
    const currentVideo = active ? videoARef.current : videoBRef.current;
    const nextVideo = active ? videoBRef.current : videoARef.current;
    
    if (!currentVideo || !nextVideo) return;
    
    let preloaded = false;

    const handleTimeUpdate = () => {
      // Preload next video 2 seconds before current ends
      if (!preloaded && currentVideo.duration - currentVideo.currentTime < 2) {
        const nextIndex = (index + 1) % videos.length;
        nextVideo.src = videos[nextIndex];
        nextVideo.load(); // starts prebuffering
        preloaded = true;
      }
    };

    const handleEnded = async () => {
      try {
        await nextVideo.play(); // should already be buffered
        setActive((prev) => !prev);
        setIndex((prev) => (prev + 1) % videos.length);
      } catch (err) {
        console.error("Playback failed:", err);
      }
    };

    currentVideo.addEventListener("timeupdate", handleTimeUpdate);
    currentVideo.addEventListener("ended", handleEnded);

    return () => {
      currentVideo.removeEventListener("timeupdate", handleTimeUpdate);
      currentVideo.removeEventListener("ended", handleEnded);
    };
  }, [index, active]); // Only index and active - NOT videos

  useEffect(() => {
      const user = auth.currentUser 
    if (user) {
      const docRef = doc(db, "users", user.uid)
      const updateSnap = async () => {
      const docSnap = await getDoc(docRef);
        setDocSnap(docSnap)
      }
      updateSnap()
    }
  }, []);


  return (
    <div className={styles.App}>
      <div className={styles.videoBackground}>
        <video
          ref={videoARef}
          src={videos[0]}
          autoPlay
          muted
          playsInline
          style={{ display: active ? "block" : "none" }}
        />
        <video
          ref={videoBRef}
          muted
          playsInline
          style={{ display: active ? "none" : "block" }}
        />
      </div>
      <div className={styles.content}>
        <header className={styles["App-header"]}>
          <div className={styles.profile}>
            <p className={styles["profile-para"]}>Hi, {name ? name : "Player"}!</p>
            <button 
              className={styles.profileButton}
              onClick={() => router.push("/profile")}
            >
              <img className={styles.profileImage} referrerPolicy="no-referrer" src={profilePic} />
            </button>
          </div>
          
          <div className={styles["score"]}>
            <img
              src="/trophy.png"
              className={styles["trophy"]}
              alt="trophy"
            />
            {/* Best score on any difficulty */}
            <span>
              {docSnap
                ? Math.max(...DIFFICULTY_IDS.map((id) => getHighScore(docSnap.data(), id)))
                : 0}
            </span>
          </div>

          <img
            src="/upscaled_logo.png"
            className={styles["App-logo"]}
            alt="logo"
          />

          <p className={styles["App-para"]}>Game Mode: Outdoor</p>
        </header>
        <div className={styles.logoContainer}>
        <StartButton />
      </div>
      </div>

      
    </div>
  );
}
