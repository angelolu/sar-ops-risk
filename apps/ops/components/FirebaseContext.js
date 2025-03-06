import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { saveAsyncStorageData } from './helperFunctions';

const firebaseConfig = {
    apiKey: "AIzaSyB_ybM_f166FJHXlFeb-inrw8qIhBevgAM",
    authDomain: "app.operation.tools",
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
    const firebaseReady = useRef(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        const app = initializeApp(firebaseConfig);
        firebaseApp.current = app;
        const auth = getAuth(app);

        initializeFirestore(app, { ignoreUndefinedProperties: true });


        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setIsAuthenticated(!!user);
        });

        // Cleanup subscription on unmount
        return () => {
            unsubscribe();
            firebaseReady.current = false;
            setCurrentUser(null);
            setIsAuthenticated(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated !== null) {
            firebaseReady.current = true;
        }
    }, [isAuthenticated, currentUser]);

    const signInWithGoogle = async () => {
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
            })
    }

    const signOut = async () => {
        return getAuth().signOut().then(() => {
            saveAsyncStorageData("syncedFiles", []);
            saveAsyncStorageData("readyFiles", []);
        });
    }

    const waitForFirebaseReady = () => {
        // Promise that resolves when the firebaseApp, firebaseAuth, and firebaseFirestore are set
        return new Promise((resolve) => {
            if (firebaseReady.current) {
                resolve();
            } else {
                const interval = setInterval(() => {
                    if (firebaseReady.current) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 100);
            }
        });
    }

    return (
        <FirebaseContext.Provider value={{
            firebaseApp,
            waitForFirebaseReady,
            signInWithGoogle,
            signOut,
            currentUser,
            isAuthenticated,
        }}>
            {children}
        </FirebaseContext.Provider>
    );
};