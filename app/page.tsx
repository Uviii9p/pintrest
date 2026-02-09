'use client';

import { Suspense } from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import PinGrid from '../components/PinGrid/PinGrid';
import CategoryBar from '../components/CategoryBar/CategoryBar';
import { Pin } from '@/types';
import { getAllPins } from '@/lib/api';

// Lazy load Lightbox for better performance
const Lightbox = dynamic(() => import('../components/Lightbox/Lightbox'), {
  ssr: false,
  loading: () => null
});

function HomeContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q');

  const [pins, setPins] = useState<Pin[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadPins = useCallback(async (query?: string) => {
    setLoading(true);
    setError(false);
    try {
      const data = await getAllPins(query === 'All' ? undefined : query);
      setPins(data);
    } catch (err) {
      console.error('Failed to load pins:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const activeQuery = q || (selectedCategory !== 'All' ? selectedCategory : undefined);
    loadPins(activeQuery);
  }, [selectedCategory, q, loadPins]);

  const loadingContent = useMemo(() => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      fontSize: '1.2rem',
      color: '#767676',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div className="loading-spinner" style={{
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #e60023',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      Finding the best ideas for you...
    </div>
  ), []);

  return (
    <>
      <CategoryBar onSelect={setSelectedCategory} />

      {loading ? loadingContent : <PinGrid pins={pins} onPinClick={setSelectedPin} />}

      {!loading && pins.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '100px 20px', color: '#767676' }}>
          <h2>We couldn't find any pins for "{q || selectedCategory}".</h2>
          <p>Try searching for something more general like "Design" or "Travel".</p>
        </div>
      )}

      {error && (
        <div style={{ textAlign: 'center', padding: '100px 20px', color: '#e60023' }}>
          <h2>Oops! Something went wrong.</h2>
          <p>Please refresh the page and try again.</p>
        </div>
      )}

      {selectedPin && (
        <Lightbox
          pin={selectedPin}
          onClose={() => setSelectedPin(null)}
        />
      )}
    </>
  );
}

export default function Home() {
  return (
    <main>
      <Suspense fallback={
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          fontSize: '1.2rem',
          color: '#767676'
        }}>
          Loading...
        </div>
      }>
        <HomeContent />
      </Suspense>
    </main>
  );
}
