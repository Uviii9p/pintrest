'use client';

import { useEffect, useState } from 'react';
import styles from './AdPanel.module.css';

interface Ad {
    _id: string;
    redirect_url: string;
    logo_url: string;
    ad_text: string;
}

export default function AdPanel() {
    const [ads, setAds] = useState<Ad[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [opacity, setOpacity] = useState(1);

    useEffect(() => {
        async function loadAds() {
            try {
                const res = await fetch('https://add-neon.vercel.app/api/ads');
                const data = await res.json();
                setAds(data);
            } catch (e) {
                console.error('Ads failed', e);
            } finally {
                setLoading(false);
            }
        }
        loadAds();
    }, []);

    useEffect(() => {
        if (ads.length <= 1) return;

        const interval = setInterval(() => {
            setOpacity(0);
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % ads.length);
                setOpacity(1);
            }, 500);
        }, 6000);

        return () => clearInterval(interval);
    }, [ads]);

    useEffect(() => {
        if (ads.length > 0 && ads[currentIndex]) {
            fetch(`https://add-neon.vercel.app/api/ads/${ads[currentIndex]._id}/impression`, { method: 'POST' })
                .catch(err => console.error('Impression failed', err));
        }
    }, [currentIndex, ads]);

    if (loading && ads.length === 0) return null;
    if (ads.length === 0) return null;

    const currentAd = ads[currentIndex];

    return (
        <div id="ad-platform-panel">
            <link rel="stylesheet" href="https://add-neon.vercel.app/static/css/style.css" />
            <aside className={styles.container}>
                <div
                    className={styles.adList}
                    style={{ opacity: opacity }}
                    onClick={() => window.open(currentAd.redirect_url, '_blank')}
                >
                    <div className={styles.adCardHorizontal}>
                        <img src={currentAd.logo_url} alt="" className={styles.adAvatar} />
                        <div className={styles.adContent}>
                            <h3 className={styles.adTitle}>{currentAd.ad_text}</h3>
                            <p className={styles.adSubtext}>Sponsored • Learn More</p>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
}
