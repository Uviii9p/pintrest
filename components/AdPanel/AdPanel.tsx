'use client';

import { useEffect, useState } from 'react';
import styles from './AdPanel.module.css';

interface Ad {
    redirect_url: string;
    logo_url: string;
    ad_text: string;
}

export default function AdPanel() {
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);

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

    if (loading && ads.length === 0) return null;

    return (
        <div id="ad-platform-panel">
            <link rel="stylesheet" href="https://add-neon.vercel.app/static/css/style.css" />
            <aside className={styles.container} id="external-ads-list">
                {ads.map((ad, index) => (
                    <div
                        key={index}
                        className={styles.adCard}
                        onClick={() => window.open(ad.redirect_url, '_blank')}
                    >
                        <img src={ad.logo_url} alt="" className={styles.adImage} />
                        <h3 className={styles.adText}>{ad.ad_text}</h3>
                    </div>
                ))}
            </aside>
        </div>
    );
}
