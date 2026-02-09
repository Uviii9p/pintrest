'use client';

import { memo } from 'react';
import styles from './PinGrid.module.css';
import PinCard from '../Pin/PinCard';
import { Pin } from '@/types';

interface PinGridProps {
    pins: Pin[];
    onPinClick?: (pin: Pin) => void;
}

function PinGrid({ pins, onPinClick }: PinGridProps) {
    return (
        <div className={styles.masonry}>
            {pins.map((pin) => (
                <PinCard key={pin.id} pin={pin} onClick={onPinClick} />
            ))}
        </div>
    );
}

// Memoize to prevent unnecessary re-renders
export default memo(PinGrid);
