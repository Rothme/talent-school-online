import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
} from 'firebase/auth';
import {
  doc, setDoc, getDoc,
  collection, addDoc, getDocs, query, where,
} from 'firebase/firestore';
import { auth, db } from '../utils/firebase';
import { generateStudentId } from '../utils/studentId';

const AuthContext = createContext();
export function useAuth() { return useContext(AuthContext); }

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser]   = useState(null);
  const [userProfile, setUserProfile]   = useState(null);
  const [loading, setLoading]           = useState(true);

  async function registerParent(email, password, displayName) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(user);
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid, email, displayName,
      role: 'parent', children: [],
      createdAt: new Date().toISOString(),
      subscription: 'trial',
    });
    await signOut(auth);
    return user;
  }

  async function login(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    if (!result.user.emailVerified) {
      await signOut(auth);
      const err = new Error('email-not-verified');
      err.code = 'auth/email-not-verified';
      throw err;
    }
    return result;
  }

  async function logout() {
    setUserProfile(null);
    return signOut(auth);
  }

  async function fetchUserProfile(uid) {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) { setUserProfile(snap.data()); return snap.data(); }
    return null;
  }

  async function addChild(parentUid, childData) {
    const studentId = generateStudentId(childData.name);
    const childRef = await addDoc(collection(db, 'children'), {
      ...childData,
      studentId,
      parentUid,
      createdAt: new Date().toISOString(),
      progress: { coding: 0, chess: 0, typing: 0 },
      streak: 0, totalXP: 0,
      lessonsComplete: { coding: 0, chess: 0, typing: 0 },
    });
    const parentSnap = await getDoc(doc(db, 'users', parentUid));
    const existing = parentSnap.data()?.children || [];
    await setDoc(doc(db, 'users', parentUid), {
      ...parentSnap.data(),
      children: [...existing, childRef.id],
    });
    return { id: childRef.id, studentId };
  }

  async function getChildren(parentUid) {
    const q = query(collection(db, 'children'), where('parentUid', '==', parentUid));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  async function loginChild(studentId, pin) {
    const q = query(
      collection(db, 'children'),
      where('studentId', '==', studentId.toUpperCase().trim())
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      const err = new Error('child-not-found');
      err.code = 'child/not-found';
      throw err;
    }
    const child = { id: snap.docs[0].id, ...snap.docs[0].data() };
    if (child.pin !== pin) {
      const err = new Error('wrong-pin');
      err.code = 'child/wrong-pin';
      throw err;
    }
    return child;
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user && user.emailVerified) await fetchUserProfile(user.uid);
      setLoading(false);
    });
    return unsub;
  }, []);

  const value = {
    currentUser, userProfile, loading,
    registerParent, login, logout,
    fetchUserProfile, addChild, getChildren, loginChild,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
