'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreatePin() {
    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: 'hsl(var(--text-muted))' }}>
                <ArrowLeft size={20} />
                <span>Back to feed</span>
            </Link>
            <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Create Pin</h1>
            <p style={{ color: 'hsl(var(--text-muted))', marginBottom: '32px' }}>Upload your high-quality photos or videos to share with the world.</p>

            <div style={{
                border: '2px dashed hsl(var(--surface-300))',
                borderRadius: 'var(--r-xl)',
                height: '400px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'hsl(var(--surface-100))',
                cursor: 'pointer'
            }}>
                <div style={{ backgroundColor: 'hsl(var(--surface-200))', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '24px', margin: 'auto' }}>↑</span>
                </div>
                <p style={{ fontWeight: 600 }}>Choose a file or drag and drop here</p>
                <p style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', marginTop: '8px' }}>We recommend using high quality .jpg files less than 20MB</p>
            </div>
        </div>
    );
}
