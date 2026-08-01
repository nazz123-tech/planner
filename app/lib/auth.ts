// SIGNIN SIGNUP LOGOUT GOOGLE AUTH
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider , signOut} from 'firebase/auth';
import { auth } from './firebase';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { User } from 'firebase/auth';
import { RegisterFormData } from '../components/forms/RegisterForm/RegisterForm';
import { LoginFormData } from '../components/forms/LoginForm/LoginForm';

export async function ensureUserDocument(user: User) {
  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    await setDoc(userRef, {
      name: user.displayName ?? '',
      email: user.email ?? '',
      createdAt: new Date().toISOString(),
    });
  }
}

// SIGNIN
const googleProvider = new GoogleAuthProvider();

export async function signInWithEmail({email, password}:LoginFormData) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signInWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    await ensureUserDocument(result.user);
}

// SIGNUP

export const signUp = async ({email,password,name}:RegisterFormData) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName: name });
    await ensureUserDocument(userCredential.user);
    await userCredential.user.reload()
  return userCredential;
};

// LOGOUT

export const logout = async () => {
  await signOut(auth)
}
