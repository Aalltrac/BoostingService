import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";
import { CREATOR_UID } from "./constants";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const ensureUserDoc = async (fbUser, extra = {}) => {
    const ref = doc(db, "users", fbUser.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const data = {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || extra.displayName || fbUser.email?.split("@")[0],
        photoURL: fbUser.photoURL || null,
        isCreator: fbUser.uid === CREATOR_UID,
        isBooster: fbUser.uid === CREATOR_UID,
        createdAt: serverTimestamp(),
      };
      await setDoc(ref, data);
      return data;
    }
    return snap.data();
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setUser(fbUser);
        const p = await ensureUserDoc(fbUser);
        setProfile(p);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const refreshProfile = async () => {
    if (!user) return;
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) setProfile(snap.data());
  };

  const loginEmail = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const signupEmail = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) await updateProfile(cred.user, { displayName });
    await ensureUserDoc(cred.user, { displayName });
    return cred;
  };

  const loginGoogle = () => signInWithPopup(auth, googleProvider);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        loginEmail,
        signupEmail,
        loginGoogle,
        logout,
        refreshProfile,
        isCreator: user?.uid === CREATOR_UID,
        isBooster: profile?.isBooster || user?.uid === CREATOR_UID,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
