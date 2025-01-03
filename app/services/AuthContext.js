import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, updateProfile as firebaseUpdateProfile } from 'firebase/auth';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../firebaseConfig';

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const customAuth = initializeAuth(auth.app, {
            persistence: getReactNativePersistence(ReactNativeAsyncStorage)
        });

        const unsubscribe = onAuthStateChanged(customAuth, (user) => {
            if (user) {
                const userData = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                };
                setUser(userData);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signOut = async () => {
        try {
            await auth.signOut();
            setUser(null);
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    };

    const updateProfile = async (updatedData) => {
        if (!user) return;

        try {
            await firebaseUpdateProfile(auth.currentUser, {
                displayName: updatedData.username,
                photoURL: updatedData.photoURL || null,
            });
            
            if (updatedData.email) {
                await auth.currentUser.updateEmail(updatedData.email);
            }
            
            if (updatedData.password) {
                await auth.currentUser.updatePassword(updatedData.password);
            }
            
            const updatedUser = {
                ...user,
                displayName: updatedData.username,
                email: updatedData.email || user.email,
            };
            setUser(updatedUser);
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signOut, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;