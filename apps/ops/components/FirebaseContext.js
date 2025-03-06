import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useRef } from 'react';

const firebaseConfig = {
    apiKey: "AIzaSyB_ybM_f166FJHXlFeb-inrw8qIhBevgAM",
    authDomain: "opsrisk-1b86f.firebaseapp.com",
    projectId: "opsrisk-1b86f",
    storageBucket: "opsrisk-1b86f.firebasestorage.app",
    messagingSenderId: "365411203856",
    appId: "1:365411203856:web:fcab9001ac4154ef33c395"
};

const FirebaseContext = createContext();
const provider = new GoogleAuthProvider();

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider = ({ children }) => {
    const firebaseApp = useRef(null);

    useEffect(() => {
        const app = initializeApp(firebaseConfig);
        firebaseApp.current = app;
        getAuth(app);
        getFirestore(app);
    }, []);

    const signInWithGoogle = () => {
        return signInWithPopup(getAuth(), provider)
            .then((result) => {
                // This gives you a Google Access Token. You can use it to access the Google API.
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;
                // The signed-in user info.
                const user = result.user;
                if (!user.email.endsWith('@ca-sar.org')) {
                    // Sign out the user
                    getAuth().signOut();
                    // This is unsafe but we're doing it for now
                    // TODO: Manage allowed accounts and org accounts on the server side
                }
            }).catch((error) => {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                // The email of the user's account used.
                const email = error.customData.email;
                // The AuthCredential type that was used.
                const credential = GoogleAuthProvider.credentialFromError(error);
                // ...
                // console.log(errorCode, errorMessage, email, credential);
            });
    }

    const waitForFirebaseReady = () => {
        // Promise that resolves when the firebaseApp, firebaseAuth, and firebaseFirestore are set
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (firebaseApp.current) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        }
        );
    }

    return (
        <FirebaseContext.Provider value={{ firebaseApp, waitForFirebaseReady, signInWithGoogle }}>
            {children}
        </FirebaseContext.Provider>
    );
};
