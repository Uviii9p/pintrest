'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Upload, MoreHorizontal, ArrowUpRight, Play } from 'lucide-react';
import styles from './PinCard.module.css';
import { Pin } from '@/types';

interface PinCardProps {
    pin: Pin;
    onClick?: (pin: Pin) => void;
}

export default function PinCard({ pin, onClick }: PinCardProps) {
    const [imgSrc, setImgSrc] = useState(pin.image);

    const getHostname = (url?: string) => {
        if (!url) return pin.source || 'Inspiration';
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return pin.source || 'Inspiration';
        }
    };

    return (
        <div className={styles.cardWrapper} onClick={() => onClick?.(pin)}>
            <div className={styles.card}>
                <div className={styles.imageContainer}>
                    {pin.type === 'video' && pin.video ? (
                        <>
                            <video
                                className={styles.image}
                                poster={imgSrc}
                                muted
                                loop
                                playsInline
                                onMouseOver={(e) => e.currentTarget.play()}
                                onMouseOut={(e) => {
                                    e.currentTarget.pause();
                                    e.currentTarget.currentTime = 0;
                                }}
                                src={pin.video}
                            />
                            <div className={styles.videoBadge}>
                                <Play size={12} fill="currentColor" />
                            </div>
                        </>
                    ) : (
                        <Image
                            src={imgSrc}
                            alt={pin.title}
                            width={pin.width}
                            height={pin.height}
                            className={styles.image}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            priority={false}
                            unoptimized={true} // Always unoptimized to support external domains without config issues
                            onError={() => setImgSrc(`https://picsum.photos/seed/${pin.id}/400/600`)} // Fallback
                        />
                    )}
                    <div className={styles.overlay}>
                        <div className={styles.overlayTop}>
                            <span className={styles.boardSelect}>{pin.source || 'Discovery'} <span className={styles.chevron}>∨</span></span>
                            <button className={styles.saveButton} onClick={(e) => e.stopPropagation()}>Save</button>
                        </div>
                        <div className={styles.overlayBottom}>
                            <a href={pin.link || '#'} target="_blank" rel="noreferrer" className={styles.linkButton} onClick={(e) => e.stopPropagation()}>
                                <ArrowUpRight size={14} className={styles.linkIcon} />
                                <span className={styles.linkText}>{getHostname(pin.link)}</span>
                            </a>
                            <div className={styles.actions}>
                                <button className={styles.iconButton} onClick={(e) => e.stopPropagation()}><Upload size={16} /></button>
                                <button className={styles.iconButton} onClick={(e) => e.stopPropagation()}><MoreHorizontal size={16} /></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.info}>
                {pin.title && <h3 className={styles.title}>{pin.title}</h3>}
                <div className={styles.user}>
                    {pin.user.avatar ? (
                        <img src={pin.user.avatar} alt={pin.user.name} className={styles.avatar} onError={(e) => e.currentTarget.style.display = 'none'} />
                    ) : (
                        <div className={styles.avatarPlaceholder}>{pin.user.name[0]}</div>
                    )}
                    <span className={styles.username}>{pin.user.name}</span>
                </div>
            </div>
        </div>
    );
}
