'use client'
import { auth, provider } from '@/lib/firebase/auth';
import { persistor } from '@/lib/redux/store';
import { clearUser, setUser } from '@/lib/redux/UserSlice';
import { createUserWithEmailAndPassword, getAuth, GoogleAuthProvider, inMemoryPersistence, setPersistence, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import React, { use, useState } from 'react'
import { useDispatch } from 'react-redux'
import axios from 'axios';

const useAuthentication = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    const signInCall = async (email: string, password: string) => {
        setLoading(true);
        try {
            const { user } = await signInWithEmailAndPassword(auth, email, password);

            const userInfo = {
                email: user.email,
                verified: user.emailVerified,
                provider: user.providerData[0].providerId,
                name: user.displayName,
                avatar: user.photoURL,
                uid: user.uid
            }
            // console.log();

            const idToken = await user.getIdToken();
            const res = await axios.post('http://localhost:3000/api/users', {
                userInfo,
                tokenId: idToken
            });
            // console.log(res);
            dispatch(setUser(userInfo));
            router.push('/dashboard');
            return null
        } catch (error) {
            return error
        } finally {
            setLoading(false);
        }
    }

    const signUpCall = async (email: string, password: string) => {
        setLoading(true);
        try {
            const { user } = await createUserWithEmailAndPassword(auth, email, password);
            const userInfo = {
                email: user.email,
                verified: user.emailVerified,
                provider: user.providerData[0].providerId,
                name: user.displayName,
                avatar: user.photoURL,
                uid: user.uid
            }
            const idToken = await user.getIdToken();
            // console.log(idToken);

            const res = await axios.post('http://localhost:3000/api/users', {
                userInfo,
                tokenId: idToken
            });
            dispatch(setUser(userInfo))
            router.push('/dashboard');
            return null;
        } catch (error) {
            return error
        } finally {
            setLoading(false);
        }
    }

    const signOutCall = async () => {
        setLoading(true);
        try {
            await signOut(auth);
            const res = await axios.post('http://localhost:3000/api/users/signout');
            dispatch(clearUser());
            router.push('/signin')
        } catch (error) {
            console.log(error);
            return error
        } finally {
            setLoading(false);
        }
    }

    const googlePopUp = async () => {
        try {
            setLoading(true);
            const result = await signInWithPopup(auth, provider);
            // console.log(result);

            const credential = GoogleAuthProvider.credentialFromResult(result);
            // const token = credential!.accessToken;

            const user = result.user;
            const idToken = await user.getIdToken();
            // console.log(idToken);


            const userInfo = {
                email: user.email,
                verified: user.emailVerified,
                provider: user.providerData[0].providerId,
                name: user.displayName,
                avatar: user.photoURL,
                uid: user.uid
            }
            const res = await axios.post('http://localhost:3000/api/users', {
                userInfo,
                tokenId: idToken,
            })

            dispatch(setUser(userInfo));
            router.push('/dashboard');
            return null;
        } catch (error: any) {
            console.log("error is ", error);

            const errorCode = error.code;
            const errorMessage = error.message;
            const email = error.customData?.email;
            const credential = GoogleAuthProvider.credentialFromError(error);

            return error;
        } finally {
            setLoading(false);
        }
    };

    return { loading, signInCall, signUpCall, signOutCall, googlePopUp }
}

export default useAuthentication