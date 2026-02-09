'use client';

import { useState, useEffect } from 'react';
import styles from './CategoryBar.module.css';

interface CategoryBarProps {
    onSelect: (category: string) => void;
}

const initialCategories = [
    'All',
    'Videos',
    'Art',
    'Design',
    'Photography',
    'Architecture',
    'Nature',
    'Space',
    'Animals',
    'Dogs',
    'Cats',
    'NASA',
    'Abstract',
    'Travel',
    'Food',
    'Fashion',
    'Technology',
    'Minimal'
];

export default function CategoryBar({ onSelect }: CategoryBarProps) {
    const [active, setActive] = useState('All');
    const [categories, setCategories] = useState(initialCategories);

    useEffect(() => {
        const updateCategories = () => {
            const isNSFW = localStorage.getItem('nsfw_enabled') === 'true';
            let newCategories = [...initialCategories];
            if (isNSFW) {
                newCategories = ['18+', 'Porn', 'Hentai', ...initialCategories];
            }

            // Only update state if categories have actually changed to prevent infinite loops
            if (JSON.stringify(newCategories) !== JSON.stringify(categories)) {
                setCategories(newCategories);
            }
        };

        updateCategories();
        window.addEventListener('settingsChanged', updateCategories);
        return () => window.removeEventListener('settingsChanged', updateCategories);
    }, [categories]); // Added categories to dependency array to ensure the comparison in updateCategories is always against the latest state.

    const handleClick = (category: string) => {
        setActive(category);
        onSelect(category);
    };

    return (
        <div className={styles.container}>
            <div className={styles.scrollArea}>
                {categories.map((category) => (
                    <button
                        key={category}
                        className={`${styles.category} ${active === category ? styles.active : ''}`}
                        onClick={() => handleClick(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>
        </div>
    );
}
