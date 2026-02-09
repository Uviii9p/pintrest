'use client';

import { X, Upload, MoreHorizontal, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './Lightbox.module.css';
import { Pin } from '@/types';

interface LightboxProps {
    pin: Pin;
    onClose: () => void;
}

export default function Lightbox({ pin, onClose }: LightboxProps) {
    const { user, savePin, unsavePin, isSaved } = useAuth();
    const router = useRouter();
    const saved = isSaved(pin.id);

    const handleSave = () => {
        if (!user) {
            router.push('/login');
            return;
        }
        if (saved) {
            unsavePin(pin.id);
        } else {
            savePin(pin.id);
        }
    };

    const handleDownload = async () => {
        if (!user) {
            router.push('/login');
            return;
        }

        try {
            const mediaUrl = pin.type === 'video' && pin.video ? pin.video : pin.image;
            const downloadUrl = `/api/download?url=${encodeURIComponent(mediaUrl)}&filename=${pin.id}`;

            const res = await fetch(downloadUrl, {
                headers: {
                    'x-user-id': user.id,
                },
            });

            if (res.status === 401) {
                router.push('/login');
                return;
            }

            if (!res.ok) throw new Error('Failed to fetch file');

            const contentType = res.headers.get('content-type') || '';
            let ext = 'jpg';
            if (contentType.includes('video/mp4')) ext = 'mp4';
            else if (contentType.includes('image/png')) ext = 'png';
            else if (contentType.includes('image/webp')) ext = 'webp';
            else if (contentType.includes('image/gif')) ext = 'gif';

            const blob = await res.blob();
            const objectUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = `${pin.id}.${ext}`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(objectUrl);
        } catch (e) {
            console.error('Download failed', e);
            window.open(pin.image, '_blank');
        }
    };
    return (
        <div className={styles.backdrop} onClick={onClose}>
            <button className={styles.closeButton} onClick={onClose}>
                <X size={24} />
            </button>

            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.content}>
                    <div className={styles.mediaSection}>
                        {pin.type === 'video' && pin.video ? (
                            <video
                                src={pin.video}
                                controls
                                autoPlay
                                className={styles.media}
                                poster={pin.image}
                            />
                        ) : (
                            <Image
                                src={pin.image}
                                alt={pin.title}
                                width={pin.width}
                                height={pin.height}
                                className={styles.media}
                            />
                        )}
                    </div>

                    <div className={styles.detailsSection}>
                        <div className={styles.topActions}>
                            <div className={styles.leftIcons}>
                                <button className={styles.iconButton} onClick={handleDownload} title="Download">
                                    <Upload size={20} style={{ transform: 'rotate(180deg)' }} />
                                </button>
                                <button className={styles.iconButton}><MoreHorizontal size={20} /></button>
                            </div>
                            <button
                                className={`${styles.saveButton} ${saved ? styles.saved : ''}`}
                                onClick={handleSave}
                            >
                                {saved ? 'Saved' : 'Save'}
                            </button>

                            <div className={styles.info}>
                                <a href={pin.link || '#'} target="_blank" rel="noreferrer" className={styles.pinLink}>
                                    {pin.link ? new URL(pin.link).hostname : 'pinterest.com'}
                                </a>
                                <h1 className={styles.title}>{pin.title}</h1>
                            </div>

                            <div className={styles.userRow}>
                                <div className={styles.userInfo}>
                                    {pin.user.avatar ? (
                                        <img src={pin.user.avatar} alt={pin.user.name} className={styles.avatar} />
                                    ) : (
                                        <div className={styles.avatarPlaceholder}>{pin.user.name[0]}</div>
                                    )}
                                    <div className={styles.userMeta}>
                                        <span className={styles.username}>{pin.user.name}</span>
                                        <span className={styles.followers}>24k followers</span>
                                    </div>
                                </div>
                                <button className={styles.followButton}>Follow</button>
                            </div>

                            <div className={styles.commentsPlaceholder}>
                                <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Comments</h3>
                                <p style={{ color: 'hsl(var(--text-muted))', marginTop: '8px' }}>No comments yet! Add one precisely.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
