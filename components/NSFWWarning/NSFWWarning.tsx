'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import styles from './NSFWWarning.module.css';

export default function NSFWWarning() {
    const [isVisible, setIsVisible] = useState(true);
    const [isNSFWEnabled, setIsNSFWEnabled] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('nsfw_enabled');
        setIsNSFWEnabled(stored === 'true');

        // Load dismissal state
        const dismissed = localStorage.getItem('nsfw_warning_dismissed');
        if (dismissed === 'true') {
            setIsVisible(false);
        }

        // Listen for settings changes
        const handleSettingsChange = () => {
            const updated = localStorage.getItem('nsfw_enabled');
            setIsNSFWEnabled(updated === 'true');
        };

        window.addEventListener('settingsChanged', handleSettingsChange);
        return () => window.removeEventListener('settingsChanged', handleSettingsChange);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem('nsfw_warning_dismissed', 'true');
    };

    const handleOpenSettings = () => {
        // Dispatch custom event to open settings in Header
        window.dispatchEvent(new CustomEvent('openSettings'));
    };

    // Don't show if NSFW is enabled or if dismissed
    if (!isVisible || isNSFWEnabled) {
        return null;
    }

    return (
        <div className={styles.warningBanner}>
            <div className={styles.content}>
                <AlertCircle size={20} className={styles.icon} />
                <div className={styles.text}>
                    <strong>Content is filtered by default</strong>
                    <span> for safety. Enabling 18+ mode will disable these filters.</span>
                </div>
                <button
                    className={styles.settingsLink}
                    onClick={handleOpenSettings}
                >
                    Manage Settings
                </button>
            </div>
            <button
                className={styles.closeBtn}
                onClick={handleClose}
                aria-label="Close warning"
                title="Dismiss"
            >
                <X size={20} />
            </button>
        </div>
    );
}
