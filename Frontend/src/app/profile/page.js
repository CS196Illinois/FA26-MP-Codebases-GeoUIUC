// Profile Page
// Route: /profile

"use client"

import styles from "./page.module.css";
import Link from "next/link";
import React, { useState, useEffect } from 'react';
import SignOut from "@/components/SignoutButton";
import DeleteAccount from "@/components/DeleteAccountButton";
import { db } from "../../components/firebase-config"
import useAuthUser from "@/components/useAuthUser"
import { doc, getDoc } from 'firebase/firestore'

export default function Profile() {
  const [profilePic, setProfilePic] = useState();
  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [docSnap, setDocSnap] = useState();
  const { user } = useAuthUser();

  useEffect(() => {
    setProfilePic(localStorage.getItem("profilePic"));
    setName(localStorage.getItem("name"));
    setEmail(localStorage.getItem("email"));
  }, []);

  useEffect(() => {
    // Wait until Firebase has restored the session before loading scores
    if (!user) return
    const docRef = doc(db, "users", user.uid)
    const updateSnap = async () => {
      const docSnap = await getDoc(docRef);
      setDocSnap(docSnap)
    }
    updateSnap()
  }, [user]);


  return (
    <div className={styles['container-with-background']}>
      
      <Link href= "\lobby">
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