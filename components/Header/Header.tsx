'use client';

import { useState, useEffect, Suspense } from 'react';
import { Search, Bell, MessageSquareText, ChevronDown, Settings, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import styles from './Header.module.css';
import SettingsModal from '../Settings/SettingsModal';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';

function HeaderContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user, logout } = useAuth();
    const { chats } = useChat();

    const unreadCount = chats.reduce((sum, chat) => sum + chat.unread, 0);

    useEffect(() => {
        setSearchQuery(searchParams.get('q') || '');
    }, [searchParams]);

    useEffect(() => {
        // Listen for request to open settings from NSFWWarning
        const handleOpenSettings = () => {
            setIsSettingsOpen(true);
        };
        
        window.addEventListener('openSettings', handleOpenSettings as EventListener);
        return () => window.removeEventListener('openSettings', handleOpenSettings as EventListener);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/?q=${encodeURIComponent(searchQuery)}`);
        } else {
            router.push('/');
        }
    };

    const handleSettingsUpdate = () => {
        // Refresh page or trigger re-fetch if needed
        window.dispatchEvent(new Event('storage')); // Notify other components
    };

    const isActive = (path: string) => pathname === path || (path === '/' && pathname === '/');

    return (
        <header className={styles.header}>
            <div className={styles.logoContainer}>
                <Link href="/" className={styles.logoLink} aria-label="Home">
                    <img src="/logo.svg" alt="Logo" className={styles.logoImg} />
                </Link>
            </div>

            <nav className={`${styles.nav} ${mobileOpen ? styles.navOpen : ''}`}>
                <Link href="/" className={`${styles.navItem} ${isActive('/') ? styles.active : ''}`}>Home</Link>
                <Link href="/create" className={`${styles.navItem} ${isActive('/create') ? styles.active : ''}`}>Create</Link>
            </nav>

            <button className={styles.mobileToggle} onClick={() => setMobileOpen(v => !v)} aria-label="Toggle menu">
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className={styles.searchContainer}>
                <form onSubmit={handleSearch} className={styles.searchWrapper}>
                    <Search className={styles.searchIcon} size={20} strokeWidth={2.5} />
                    <input
                        type="text"
                        placeholder="Search for inspiration"
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </form>
            </div>

            <div className={styles.actions}>
                <button className={styles.iconButton} aria-label="Notifications">
                    <Bell size={24} className={styles.icon} />
                    <span className={styles.badge}>3</span>
                </button>
                <button
                    className={styles.iconButton}
                    aria-label="Messages"
                    onClick={() => router.push('/chat')}
                >
                    <MessageSquareText size={24} className={styles.icon} />
                    {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
                </button>
                <button
                    className={styles.iconButton}
                    aria-label="Settings"
                    onClick={() => setIsSettingsOpen(true)}
                >
                    <Settings size={24} className={styles.icon} />
                </button>

                {user ? (
                    <>
                        <Link href="/profile" className={styles.profileLink}>
                            {user.avatar ? (
                                <img src={user.avatar} className={styles.avatar} alt={user.username} />
                            ) : (
                                <div className={styles.avatarPlaceholder}>
                                    {user.username[0].toUpperCase()}
                                </div>
                            )}
                        </Link>
                        <button
                            className={styles.logoutButton}
                            onClick={() => {
                                logout();
                                router.push('/');
                            }}
                        >
                            Log out
                        </button>
                    </>
                ) : (
                    <button
                        className={styles.loginButton}
                        onClick={() => router.push('/login')}
                    >
                        Log in
                    </button>
                )}

                <button className={styles.iconButtonSmall} aria-label="More">
                    <ChevronDown size={20} />
                </button>
            </div>

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                onUpdate={handleSettingsUpdate}
            />
        </header>
    );
}

export default function Header() {
    return (
        <Suspense fallback={
            <header className={styles.header}>
                <div style={{ width: '100%', height: '100%' }}></div>
            </header>
        }>
            <HeaderContent />
        </Suspense>
    );
}
