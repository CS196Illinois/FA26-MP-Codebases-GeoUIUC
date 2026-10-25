// Profile Page
// Route: /profile

"use client"

import styles from "./page.module.css";
import Link from "next/link";
import React, { useState, useEffect } from 'react';
import SignOut from "@/components/SignoutButton";
import DeleteAccount from "@/components/DeleteAccountButton";
import { useRouter } from "next/navigation";
import {auth, db} from "../../components/firebase-config"
import { doc, getDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

export default function Profile() {
  const router = useRouter();
  const [profilePic, setProfilePic] = useState();
  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [docSnap, setDocSnap] = useState();

  useEffect(() => {
    // Firebase restores the signed-in user asynchronously, so auth.currentUser
    // is null on first render. Wait for it before reading the user's data.
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setName(user.displayName);
      setEmail(user.email);
      setProfilePic(user.photoURL);
      try {
        setDocSnap(await getDoc(doc(db, "users", user.uid)));
      } catch (error) {
        console.error("Error loading profile stats", error);
      }
    });
    return unsubscribe;
  }, [router]);


  return (
    <div className={styles['container-with-background']}>

      <Link href="/lobby">
        <img className={styles.logo} src="./logo.png" />
      </Link>
    
      <div className={styles.container}>
        
        <div className={styles.profileContainer}>
          <img className={styles.img} referrerPolicy="no-referrer" src={profilePic} />
          <h1>{name}</h1>
          <h3>Email: {email}</h3>
        </div>

        <div className={styles.profileContainer2}>
          <h1>High Score: {docSnap ? docSnap.get("highScore") : 0} </h1>
          <h1>Total Points: {docSnap ? docSnap.get("totalPoints") : 0} </h1>
          <br></br>
          <div className={styles['button-container']}>
            <SignOut/>
            <DeleteAccount/>
          </div>
        </div>
        
      </div>
    </div>
  );
}