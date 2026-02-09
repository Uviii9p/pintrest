'use client';

import { useState, useEffect } from 'react';
import { X, Shield, Lock, Eye, EyeOff } from 'lucide-react';
import styles from './SettingsModal.module.css';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export default function SettingsModal({ isOpen, onClose, onUpdate }: SettingsModalProps) {
    const [isNSFW, setIsNSFW] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('nsfw_enabled');
        setIsNSFW(stored === 'true');
    }, [isOpen]);

    const toggleNSFW = () => {
        const newValue = !isNSFW;
        setIsNSFW(newValue);
        localStorage.setItem('nsfw_enabled', String(newValue));

        // Dispatch event for other components
        window.dispatchEvent(new Event('settingsChanged'));
        onUpdate();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Settings</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.content}>
                    <div className={styles.section}>
                        <h3>Content Preferences</h3>

                        <div className={styles.settingItem}>
                            <div className={styles.settingInfo}>
                                <div className={styles.labelRow}>
                                    <span className={styles.label}>18+ Content</span>
                                    {isNSFW ? <Eye size={16} className={styles.iconRef} /> : <EyeOff size={16} />}
                                </div>
                                <p className={styles.description}>
                                    Unlock 18+ category. Contains explicit content (NSFW).
                                </p>
                            </div>
                            <button
                                className={`${styles.toggle} ${isNSFW ? styles.active : ''}`}
                                onClick={toggleNSFW}
                            >
                                <div className={styles.knob} />
                            </button>
                        </div>
                    </div>

                    <div className={styles.warning}>
                        <Shield size={16} />
                        <span>Content is filtered by default for safety. Enabling 18+ mode disables these filters.</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
