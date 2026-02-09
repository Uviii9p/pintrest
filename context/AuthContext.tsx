'use client';

import { createContext, useContext, useState, useEffect } from 'react';

// Types
export interface User {
    id: string;
    email: string;
    username: string;
    avatar?: string;
    savedPins: string[]; // Store PIN IDs
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string) => Promise<boolean>;
    logout: () => void;
    signup: (email: string, username: string) => Promise<boolean>;
    savePin: (pinId: string) => void;
    unsavePin: (pinId: string) => void;
    isSaved: (pinId: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load from LocalStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('pinterest_user');
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch (e) {
                console.error('Auth load failed', e);
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string) => {
        // Simple mock login (accepts any email if it matches stored users, or creates new for simplicity)
        const mockUser: User = {
            id: 'u-' + Date.now(),
            email,
            username: email.split('@')[0],
            savedPins: []
        };
        setUser(mockUser);
        localStorage.setItem('pinterest_user', JSON.stringify(mockUser));
        return true;
    };

    const signup = async (email: string, username: string) => {
        const newUser: User = {
            id: 'u-' + Date.now(),
            email,
            username,
            savedPins: []
        };
        setUser(newUser);
        localStorage.setItem('pinterest_user', JSON.stringify(newUser));
        return true;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('pinterest_user');
    };

    // Save Logic
    const savePin = (pinId: string) => {
        if (!user) return;
        const newSaved = [...user.savedPins, pinId];
        const updatedUser = { ...user, savedPins: newSaved };
        setUser(updatedUser);
        localStorage.setItem('pinterest_user', JSON.stringify(updatedUser)); // Persist
    };

    const unsavePin = (pinId: string) => {
        if (!user) return;
        const newSaved = user.savedPins.filter(id => id !== pinId);
        const updatedUser = { ...user, savedPins: newSaved };
        setUser(updatedUser);
        localStorage.setItem('pinterest_user', JSON.stringify(updatedUser)); // Persist
    };

    const isSaved = (pinId: string) => {
        return user?.savedPins.includes(pinId) || false;
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, signup, savePin, unsavePin, isSaved }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
