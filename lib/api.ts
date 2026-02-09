import { Pin } from '@/types';

export async function getAllPins(query?: string): Promise<Pin[]> {
    try {
        console.log(`🔍 Searching for: "${query || 'all content'}"`);

        const url = query
            ? `/api/pins?q=${encodeURIComponent(query)}`
            : '/api/pins';

        const response = await fetch(url, {
            cache: 'no-store', // Always get fresh results for searches
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            console.error(`❌ API Error: ${response.status} ${response.statusText}`);
            throw new Error(`Failed to fetch pins: ${response.statusText}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            console.error('❌ Invalid API response:', data);
            return [];
        }

        const imageCount = data.filter(p => p.type === 'image').length;
        const videoCount = data.filter(p => p.type === 'video').length;

        console.log(`✅ Received ${data.length} pins (${imageCount} images, ${videoCount} videos)`);

        return data;

    } catch (error) {
        console.error('❌ Error fetching pins:', error);
        return [];
    }
}
