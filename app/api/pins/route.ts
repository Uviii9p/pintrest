import { NextResponse } from 'next/server';
import { Pin } from '@/types';

// Helper to ensure absolute URLs and fix relative protocols
function cleanUrl(url: string | undefined): string {
    if (!url) return '';
    let cleaned = url.trim();
    if (cleaned.startsWith('//')) cleaned = `https:${cleaned}`;
    // Fix Reddit preview encoding
    cleaned = cleaned.replaceAll('&amp;', '&');
    return cleaned;
}

// Helper to safely fetch with timeout and proxy fallback
async function safeFetch(url: string, options: RequestInit = {}): Promise<any> {
    const proxies = [
        '', // Direct
        'https://api.allorigins.win/raw?url=',
        'https://api.codetabs.com/v1/proxy?quest=',
        'https://corsproxy.io/?',
        'https://jsonp.afeld.me/?url=',
        'https://proxy.cors.sh/'
    ];

    // Stage 1: Fast Direct Attempt
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
                ...options.headers,
                'Referer': 'https://www.google.com',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        clearTimeout(timeoutId);
        if (response.ok) {
            const text = await response.text();
            try { return JSON.parse(text); } catch { return null; }
        }
    } catch (e) {
        clearTimeout(timeoutId);
    }

    // Stage 2: Parallel Proxy Blitz
    const proxyFetches = proxies.slice(1).map(async (proxy) => {
        try {
            const pController = new AbortController();
            const pTimeoutId = setTimeout(() => pController.abort(), 10000);

            const decodedUrl = decodeURIComponent(url.split('url=')[1] || url.split('quest=')[1] || url);
            const finalUrl = proxy.includes('?') ? `${proxy}${encodeURIComponent(decodedUrl)}` : `${proxy}${decodedUrl}`;

            const res = await fetch(finalUrl, {
                ...options,
                signal: pController.signal,
                headers: {
                    ...options.headers,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });
            clearTimeout(pTimeoutId);
            if (res.ok) {
                const text = await res.text();
                try {
                    const data = JSON.parse(text);
                    if (data && (Array.isArray(data) || typeof data === 'object')) return data;
                } catch { return null; }
            }
        } catch { return null; }
        return null;
    });

    const results = await Promise.all(proxyFetches);
    return results.find(r => r !== null) || null;
}


// YouTube Fetcher (via Invidious instances for keyless access)
async function fetchFromYouTube(query?: string): Promise<Pin[]> {
    try {
        const q = query?.trim() || 'trending';
        // Rotate public instances to ensure availability
        const instances = [
            'https://inv.tux.pizza',
            'https://vid.puffyan.us',
            'https://invidious.drgns.space'
        ];
        const instance = instances[Math.floor(Math.random() * instances.length)];
        const url = `${instance}/api/v1/search?q=${encodeURIComponent(q)}&type=video&sort=relevance`;

        const data = await safeFetch(url);
        if (!Array.isArray(data)) return [];

        return data.slice(0, 10).map((video: any) => ({
            id: `yt-${video.videoId}`,
            title: video.title,
            image: `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`,
            // Use Invidious proxy for video playback or fallback to youtube link
            // Note: Direct streaming might be rate limited, but we provide the link
            video: `${instance}/latest_version?id=${video.videoId}&itag=18`,
            height: 720,
            width: 1280,
            type: 'video',
            user: { name: video.author, avatar: '' },
            link: `https://youtube.com/watch?v=${video.videoId}`,
            source: 'YouTube'
        }));
    } catch (e) {
        console.error('YouTube fetch error:', e);
        return [];
    }
}

// Google & Web Search (via SearXNG public instances)
async function fetchFromGoogle(query?: string, mode: 'image' | 'video' = 'image', safeSearch: number = 1): Promise<Pin[]> {
    try {
        if (!query) return [];
        // Rotate many instances to avoid 429 errors
        const instances = [
            'https://searx.be',
            'https://searx.run',
            'https://priv.au',
            'https://baresearch.org',
            'https://searxng.site',
            'https://search.ononoki.org',
            'https://searx.fmac.xyz',
            'https://search.indie.host'
        ];
        const instance = instances[Math.floor(Math.random() * instances.length)];
        const format = 'json';
        const categories = mode === 'video' ? 'videos' : 'images';
        const url = `${instance}/search?q=${encodeURIComponent(query)}&format=${format}&categories=${categories}&safesearch=${safeSearch}`;

        const data = await safeFetch(url);
        if (!data?.results || !Array.isArray(data.results)) return [];

        return data.results.slice(0, 20).map((res: any) => {
            const isVideo = mode === 'video' || res.template === 'videos.html';
            return {
                id: `web-${Buffer.from(res.url).toString('base64').substring(0, 16)}`,
                title: res.title || 'Web Result',
                image: cleanUrl(res.img_src || res.thumbnail || ''),
                video: isVideo ? res.url : undefined,
                height: 800,
                width: 600,
                type: isVideo ? 'video' : 'image',
                user: { name: res.author || res.source || 'Web', avatar: '' },
                link: res.url,
                source: 'Google Search'
            };
        }).filter((p: any) => p.image);
    } catch (e) {
        return [];
    }
}

// Reddit API - Enhanced for better search
async function fetchFromReddit(query?: string, mode: 'image' | 'video' = 'image'): Promise<Pin[]> {
    try {
        let url = '';

        if (query && query.trim()) {
            // Smart search across multiple subreddits
            const searchTerm = query.toLowerCase().trim();
            const imageSubreddits = ['pics', 'Images', 'itookapicture', 'photographs', 'Art', 'Design'];
            const videoSubreddits = ['videos', 'gifs', 'BetterEveryLoop', 'oddlysatisfying'];
            const subreddit = mode === 'video' ? videoSubreddits.join('+') : imageSubreddits.join('+');

            url = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(searchTerm)}&restrict_sr=on&limit=25&sort=relevance&t=year`;
        } else {
            // Trending/hot content
            const imageSubs = ['pics', 'Art', 'Photography', 'Design', 'NatureIsFuckingLit'];
            const videoSubs = ['videos', 'gifs', 'oddlysatisfying', 'Cinemagraphs'];
            const subs = mode === 'video' ? videoSubs : imageSubs;
            const sub = subs[Math.floor(Math.random() * subs.length)];
            url = `https://www.reddit.com/r/${sub}/hot.json?limit=25`;
        }

        const data = await safeFetch(url);
        if (!data?.data?.children) return [];

        return data.data.children
            .filter((child: any) => {
                const p = child.data;
                if (p.over_18 || p.removed_by_category || !p.url) return false;

                if (mode === 'video') {
                    return p.is_video || p.post_hint === 'hosted:video' || p.url.includes('.gif');
                }
                return p.post_hint === 'image' || p.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
            })
            .slice(0, 20)
            .map((child: any) => {
                const p = child.data;
                const isVideo = p.is_video || p.post_hint === 'hosted:video';

                let imageUrl = p.url;
                if (p.preview?.images?.[0]?.source?.url) {
                    imageUrl = p.preview.images[0].source.url.replaceAll('&amp;', '&');
                }

                return {
                    id: `reddit-${p.id}-${mode}`,
                    title: p.title?.substring(0, 120) || 'Reddit Post',
                    image: imageUrl,
                    video: isVideo ? p.media?.reddit_video?.fallback_url?.split('?')[0] : undefined,
                    height: p.preview?.images?.[0]?.source?.height || 800,
                    width: p.preview?.images?.[0]?.source?.width || 600,
                    type: isVideo ? 'video' : 'image',
                    user: { name: p.author || 'Reddit', avatar: '' },
                    link: `https://reddit.com${p.permalink}`,
                    source: 'Reddit'
                } as Pin;
            });
    } catch (e: any) {
        console.error(`Reddit ${mode} error:`, e.message);
        return [];
    }
}

// Giphy - Comprehensive GIF search
async function fetchFromGiphy(query?: string): Promise<Pin[]> {
    try {
        const q = query?.trim() || 'trending';
        const apiKey = 'dc6zaTOxFJmzC';
        const endpoint = query
            ? `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(q)}&limit=20&rating=g`
            : `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=20&rating=g`;

        const data = await safeFetch(endpoint);
        if (!data?.data) return [];

        return data.data.map((gif: any) => ({
            id: `giphy-${gif.id}`,
            title: gif.title?.substring(0, 120) || 'Animated GIF',
            image: gif.images.fixed_height.url,
            video: gif.images.original.mp4,
            height: parseInt(gif.images.original.height) || 400,
            width: parseInt(gif.images.original.width) || 400,
            type: 'video',
            user: { name: gif.username || 'Giphy', avatar: '' },
            link: gif.url,
            source: 'Giphy'
        }));
    } catch (e: any) {
        console.error('Giphy error:', e.message);
        return [];
    }
}

// Pixabay - Comprehensive image/video search (works without API key in demo mode)
async function fetchFromPixabay(query?: string): Promise<Pin[]> {
    try {
        const q = query?.trim() || 'nature';
        // Using public demo key - users can add their own for higher limits
        const url = `https://pixabay.com/api/?key=9656065-a4094594c34f9ac14c7fc4c39&q=${encodeURIComponent(q)}&image_type=photo&per_page=30&safesearch=true`;

        const data = await safeFetch(url);
        if (!data?.hits) return [];

        return data.hits.map((hit: any) => ({
            id: `pixabay-${hit.id}`,
            title: hit.tags || 'Pixabay Image',
            image: hit.largeImageURL || hit.webformatURL,
            height: hit.imageHeight || 1080,
            width: hit.imageWidth || 1920,
            type: 'image',
            user: { name: hit.user, avatar: hit.userImageURL || '' },
            link: hit.pageURL,
            source: 'Pixabay'
        }));
    } catch (e: any) {
        console.error('Pixabay error:', e.message);
        return [];
    }
}

// Pexels - High quality images and videos (works with free API)
async function fetchFromPexels(query?: string, type: 'photos' | 'videos' = 'photos'): Promise<Pin[]> {
    try {
        const q = query?.trim() || 'nature';
        const apiKey = '563492ad6f917000010000010d9e1c087c2c4a2b9f7a8b9c8d8e8f90'; // Demo key

        const endpoint = type === 'photos'
            ? `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=25`
            : `https://api.pexels.com/videos/search?query=${encodeURIComponent(q)}&per_page=15`;

        const data = await safeFetch(endpoint, {
            headers: { 'Authorization': apiKey }
        });

        if (!data) return [];

        if (type === 'photos' && data.photos) {
            return data.photos.map((photo: any) => ({
                id: `pexels-${photo.id}`,
                title: photo.alt || `${q} Photo`,
                image: photo.src.large,
                height: photo.height,
                width: photo.width,
                type: 'image',
                user: { name: photo.photographer, avatar: '' },
                link: photo.url,
                source: 'Pexels'
            }));
        }

        if (type === 'videos' && data.videos) {
            return data.videos.map((video: any) => ({
                id: `pexels-video-${video.id}`,
                title: video.user?.name ? `Video by ${video.user.name}` : 'Pexels Video',
                image: video.image,
                video: video.video_files?.[0]?.link,
                height: video.height || 1080,
                width: video.width || 1920,
                type: 'video',
                user: { name: video.user?.name || 'Pexels', avatar: '' },
                link: video.url,
                source: 'Pexels'
            }));
        }

        return [];
    } catch (e: any) {
        console.error(`Pexels ${type} error:`, e.message);
        return [];
    }
}

// Picsum - Always available fallback
async function fetchFromPicsum(count: number = 15): Promise<Pin[]> {
    const pins: Pin[] = [];
    const usedIds = new Set<number>();

    for (let i = 0; i < count; i++) {
        let id = Math.floor(Math.random() * 1000);
        while (usedIds.has(id)) {
            id = Math.floor(Math.random() * 1000);
        }
        usedIds.add(id);

        pins.push({
            id: `picsum-${id}`,
            title: `Creative Inspiration`,
            image: `https://picsum.photos/id/${id}/800/1200`,
            height: 1200,
            width: 800,
            type: 'image',
            user: { name: 'Picsum', avatar: '' },
            link: 'https://picsum.photos',
            source: 'Picsum'
        });
    }

    return pins;
}

// NASA APOD
async function fetchFromNASA(): Promise<Pin[]> {
    try {
        const url = `https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&count=10`;
        const data = await safeFetch(url);

        if (!Array.isArray(data)) return [];

        return data
            .filter((item: any) => item.media_type === 'image' && item.url)
            .map((item: any) => ({
                id: `nasa-${item.date}`,
                title: item.title?.substring(0, 120) || 'NASA Image',
                image: item.url,
                height: 1080,
                width: 1920,
                type: 'image',
                user: { name: 'NASA', avatar: '' },
                link: item.hdurl || item.url,
                source: 'NASA'
            }));
    } catch (e: any) {
        console.error('NASA error:', e.message);
        return [];
    }
}

// Dogs & Cats
async function fetchAnimals(type: 'dog' | 'cat', count: number = 10): Promise<Pin[]> {
    try {
        if (type === 'dog') {
            const url = `https://dog.ceo/api/breeds/image/random/${count}`;
            const data = await safeFetch(url);
            if (!data?.message) return [];

            return data.message.map((url: string, idx: number) => ({
                id: `dog-${idx}-${Date.now()}`,
                title: `Adorable Dog`,
                image: url,
                height: 800,
                width: 600,
                type: 'image',
                user: { name: 'Dog Lovers', avatar: '' },
                link: url,
                source: 'Dogs'
            }));
        } else {
            const url = `https://api.thecatapi.com/v1/images/search?limit=${count}`;
            const data = await safeFetch(url);
            if (!Array.isArray(data)) return [];

            return data.map((cat: any) => ({
                id: `cat-${cat.id}`,
                title: `Cute Cat`,
                image: cat.url,
                height: cat.height || 800,
                width: cat.width || 600,
                type: 'image',
                user: { name: 'Cat Lovers', avatar: '' },
                link: cat.url,
                source: 'Cats'
            }));
        }
    } catch (e: any) {
        console.error(`${type} API error:`, e.message);
        return [];
    }
}

// Eporner API - High quality video collection
async function fetchFromEporner(query?: string): Promise<Pin[]> {
    try {
        const qLower = query?.toLowerCase() || '';
        const isHentai = qLower === 'hentai' || qLower.includes('hentai');
        const isGeneric = !query || ['18+', 'nsfw', 'porn', 'adult', 'sex'].includes(qLower);
        const q = isHentai ? 'hentai' : (isGeneric ? 'trending' : query!.trim());
        const url = `https://www.eporner.com/api/v2/video/search/?query=${encodeURIComponent(q)}&per_page=30&format=json&thumbsize=big`;

        const data = await safeFetch(url);
        if (!data?.results || !Array.isArray(data.results)) return [];

        return data.results.map((video: any) => ({
            id: `eporner-${video.id}`,
            title: video.title,
            image: cleanUrl(video.default_thumb?.src || video.thumbs?.[0]?.src),
            height: video.default_thumb?.height || 360,
            width: video.default_thumb?.width || 640,
            type: 'video',
            user: { name: 'EPORNER', avatar: '' },
            link: video.url,
            source: 'EPORNER'
        }));
    } catch {
        return [];
    }
}

// Pornhub Webmaster API - Global leader in content
async function fetchFromPornhub(query?: string): Promise<Pin[]> {
    try {
        const qLower = query?.toLowerCase() || '';
        const isHentai = qLower === 'hentai' || qLower.includes('hentai');
        const isGeneric = !query || ['18+', 'nsfw', 'porn', 'adult', 'sex'].includes(qLower);
        const q = isHentai ? 'hentai' : (isGeneric ? 'trending' : query!.trim());
        const url = `https://www.pornhub.com/webmasters/search?search=${encodeURIComponent(q)}&thumbsize=large_next_gen`;

        const data = await safeFetch(url);
        if (!data?.videos || !Array.isArray(data.videos)) return [];

        return data.videos.map((video: any) => ({
            id: `ph-${video.video_id}`,
            title: video.title,
            image: cleanUrl(video.default_thumb || video.thumbs?.[0]?.src),
            height: 720,
            width: 1280,
            type: 'video',
            user: { name: 'Pornhub', avatar: '' },
            link: video.url,
            source: 'Pornhub'
        }));
    } catch {
        return [];
    }
}

// XHamster API - Diverse adult content
async function fetchFromXHamster(query?: string): Promise<Pin[]> {
    try {
        const qLower = query?.toLowerCase() || '';
        const isHentai = qLower === 'hentai' || qLower.includes('hentai');
        const isGeneric = !query || ['18+', 'nsfw', 'porn', 'adult', 'sex'].includes(qLower);
        const q = isHentai ? 'hentai' : (isGeneric ? 'trending' : query!.trim());
        const url = `https://xhamster.com/xapi/v2/search/videos?search=${encodeURIComponent(q)}&limit=25`;

        const data = await safeFetch(url);
        if (!data?.videos || !Array.isArray(data.videos)) return [];

        return data.videos.map((video: any) => ({
            id: `xh-${video.id}`,
            title: video.title || 'XHamster Video',
            image: cleanUrl(video.thumb || video.preview || ''),
            height: 720,
            width: 1280,
            type: 'video',
            user: { name: 'XHamster', avatar: '' },
            link: `https://xhamster.com/videos/${video.id}`,
            source: 'XHamster'
        }));
    } catch {
        return [];
    }
}

// YouPorn API - High reliability source
async function fetchFromYouPorn(query?: string): Promise<Pin[]> {
    try {
        const qLower = query?.toLowerCase() || '';
        const isHentai = qLower === 'hentai' || qLower.includes('hentai');
        const isGeneric = !query || ['18+', 'nsfw', 'porn', 'adult', 'sex'].includes(qLower);
        const q = isHentai ? 'hentai' : (isGeneric ? 'trending' : query!.trim());
        const url = `https://www.youporn.com/api/webmasters/search?search=${encodeURIComponent(q)}&thumbsize=large`;

        const data = await safeFetch(url);
        if (!data?.videos || !Array.isArray(data.videos)) return [];

        return data.videos.map((video: any) => ({
            id: `yp-${video.video_id}`,
            title: video.title,
            image: cleanUrl(video.default_thumb || video.thumbs?.[0]?.src),
            height: 720,
            width: 1280,
            type: 'video',
            user: { name: 'YouPorn', avatar: '' },
            link: video.url,
            source: 'YouPorn'
        }));
    } catch {
        return [];
    }
}

// Porn.com API - Massive video library
async function fetchFromPornDotCom(query?: string): Promise<Pin[]> {
    try {
        const qLower = query?.toLowerCase() || '';
        const isHentai = qLower === 'hentai' || qLower.includes('hentai');
        const isGeneric = !query || ['18+', 'nsfw', 'porn', 'adult', 'sex'].includes(qLower);
        const q = isHentai ? 'hentai' : (isGeneric ? 'trending' : query!.trim());
        const url = `https://api.porn.com/webmasters/search?search=${encodeURIComponent(q)}&thumbsize=large`;

        const data = await safeFetch(url);
        if (!data?.videos || !Array.isArray(data.videos)) return [];

        return data.videos.map((video: any) => ({
            id: `pdc-${video.video_id}`,
            title: video.title,
            image: cleanUrl(video.default_thumb || video.thumbs?.[0]?.src),
            height: 720,
            width: 1280,
            type: 'video',
            user: { name: 'Porn.com', avatar: '' },
            link: video.url,
            source: 'Porn.com'
        }));
    } catch {
        return [];
    }
}

// SpankBang API - High utility video source
async function fetchFromSpankBang(query?: string): Promise<Pin[]> {
    try {
        const qLower = query?.toLowerCase() || '';
        const isHentai = qLower === 'hentai' || qLower.includes('hentai');
        const q = isHentai ? 'hentai' : (query || 'trending');
        const url = `https://spankbang.com/api/videos/search?q=${encodeURIComponent(q)}`;

        const data = await safeFetch(url);
        if (!data?.videos || !Array.isArray(data.videos)) return [];

        return data.videos.map((video: any) => ({
            id: `sb-${video.id}`,
            title: video.title,
            image: cleanUrl(video.thumbnail_url || video.preview_url),
            height: 360,
            width: 640,
            type: 'video',
            user: { name: 'SpankBang', avatar: '' },
            link: `https://spankbang.com/${video.id}/video/`,
            source: 'SpankBang'
        }));
    } catch {
        return [];
    }
}

// Beeg API - Minimalist video engine
async function fetchFromBeeg(query?: string): Promise<Pin[]> {
    try {
        const qLower = query?.toLowerCase() || '';
        const q = qLower === 'hentai' ? 'hentai' : (query || 'trending');
        const url = `https://beeg.com/api/v1/video/search?query=${encodeURIComponent(q)}`;

        const data = await safeFetch(url);
        if (!data?.videos || !Array.isArray(data.videos)) return [];

        return data.videos.map((video: any) => ({
            id: `beeg-${video.id}`,
            title: video.title,
            image: cleanUrl(video.thumbnail_url),
            height: 720,
            width: 1280,
            type: 'video',
            user: { name: 'Beeg', avatar: '' },
            link: `https://beeg.com/${video.id}`,
            source: 'Beeg'
        }));
    } catch {
        return [];
    }
}

// Gelbooru API - Massive Hentai Image & Video Database
async function fetchFromGelbooru(query?: string): Promise<Pin[]> {
    try {
        const qLower = query?.toLowerCase() || '';
        const isGeneric = !query || ['18+', 'nsfw', 'porn', 'hentai', 'all', 'adult', 'sex'].includes(qLower);
        const q = isGeneric ? 'rating:explicit' : query!.trim().replace(/ /g, '_');
        const url = `https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&limit=40&tags=${encodeURIComponent(q)}`;

        const data = await safeFetch(url);
        if (!Array.isArray(data)) return [];

        return data.map((item: any) => ({
            id: `gel-${item.id}`,
            title: item.tags || 'Gelbooru Content',
            image: cleanUrl(item.file_url),
            video: item.file_url.endsWith('.mp4') || item.file_url.endsWith('.webm') ? item.file_url : undefined,
            height: item.height || 800,
            width: item.width || 600,
            type: item.file_url.endsWith('.mp4') || item.file_url.endsWith('.webm') ? 'video' : 'image',
            user: { name: 'Gelbooru', avatar: '' },
            link: `https://gelbooru.com/index.php?page=post&s=view&id=${item.id}`,
            source: 'Gelbooru'
        }));
    } catch {
        return [];
    }
}

// Danbooru API - High Quality Anime & Hentai
async function fetchFromDanbooru(query?: string): Promise<Pin[]> {
    try {
        const qLower = query?.toLowerCase() || '';
        const isGeneric = !query || ['18+', 'nsfw', 'porn', 'hentai', 'all', 'adult', 'sex'].includes(qLower);
        const q = isGeneric ? 'rating:explicit' : `${query!.trim().replace(/ /g, '_')} rating:explicit`;
        const url = `https://danbooru.donmai.us/posts.json?tags=${encodeURIComponent(q)}&limit=40`;

        const data = await safeFetch(url);
        if (!Array.isArray(data)) return [];

        return data.map((item: any) => ({
            id: `dan-${item.id}`,
            title: item.tag_string?.substring(0, 100) || 'Danbooru Content',
            image: cleanUrl(item.large_file_url || item.file_url),
            height: item.image_height || 1000,
            width: item.image_width || 700,
            type: 'image',
            user: { name: 'Danbooru', avatar: '' },
            link: `https://danbooru.donmai.us/posts/${item.id}`,
            source: 'Danbooru'
        } as Pin)).filter(p => p.image);
    } catch {
        return [];
    }
}

// Yande.re API - High Quality Anime
async function fetchFromYandere(query?: string): Promise<Pin[]> {
    try {
        const qLower = query?.toLowerCase() || '';
        const isGeneric = !query || ['18+', 'nsfw', 'porn', 'hentai', 'all', 'adult', 'sex'].includes(qLower);
        const q = isGeneric ? 'rating:e' : `${query!.trim().replace(/ /g, '_')} rating:e`;
        const url = `https://yande.re/post.json?tags=${encodeURIComponent(q)}&limit=40`;

        const data = await safeFetch(url);
        if (!Array.isArray(data)) return [];

        return data.map((item: any) => ({
            id: `yan-${item.id}`,
            title: item.tags?.substring(0, 100) || 'Yande.re Content',
            image: cleanUrl(item.sample_url || item.file_url),
            height: item.sample_height || 1000,
            width: item.sample_width || 700,
            type: 'image',
            user: { name: 'Yandere', avatar: '' },
            link: `https://yande.re/post/show/${item.id}`,
            source: 'Yande.re'
        } as Pin)).filter(p => p.image);
    } catch {
        return [];
    }
}

// Konachan API - Huge Anime Selection
async function fetchFromKonachan(query?: string): Promise<Pin[]> {
    try {
        const qLower = query?.toLowerCase() || '';
        const isGeneric = !query || ['18+', 'nsfw', 'porn', 'hentai', 'all', 'adult', 'sex'].includes(qLower);
        const q = isGeneric ? 'rating:e' : `${query!.trim().replace(/ /g, '_')} rating:e`;
        const url = `https://konachan.com/post.json?tags=${encodeURIComponent(q)}&limit=40`;

        const data = await safeFetch(url);
        if (!Array.isArray(data)) return [];

        return data.map((item: any) => ({
            id: `kona-${item.id}`,
            title: item.tags?.substring(0, 100) || 'Konachan Content',
            image: cleanUrl(item.sample_url || item.file_url),
            height: item.sample_height || 1000,
            width: item.sample_width || 700,
            type: 'image',
            user: { name: 'Konachan', avatar: '' },
            link: `https://konachan.com/post/show/${item.id}`,
            source: 'Konachan'
        } as Pin)).filter(p => p.image);
    } catch {
        return [];
    }
}

// Rule34 API - Massive Database of 3D/Hentai/Real content
async function fetchFromRule34(query?: string): Promise<Pin[]> {
    try {
        const qLower = query?.toLowerCase() || '';
        const isHentai = qLower === 'hentai' || qLower.includes('hentai');
        const isGeneric = !query || ['18+', 'nsfw', 'porn', 'hentai', 'all', 'adult', 'sex'].includes(qLower);
        const q = isHentai ? 'hentai' : (isGeneric ? 'rating:explicit' : query!.trim().replace(/ /g, '_'));
        const url = `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&limit=40&tags=${encodeURIComponent(q)}`;

        const rawData = await safeFetch(url);
        if (!rawData) return [];

        const data = Array.isArray(rawData) ? rawData : (typeof rawData === 'object' ? Object.values(rawData) : []);
        if (data.length === 0) return [];

        return data.map((item: any) => {
            if (!item || !item.file_url) return null;
            const isVideo = item.file_url.endsWith('.mp4') || item.file_url.endsWith('.webm');
            return {
                id: `r34-${item.id}`,
                title: item.tags?.substring(0, 100) || 'Rule34 Content',
                image: cleanUrl(item.sample_url || item.file_url),
                video: isVideo ? cleanUrl(item.file_url) : undefined,
                height: item.sample_height || item.height || 800,
                width: item.sample_width || item.width || 600,
                type: isVideo ? 'video' : 'image',
                user: { name: 'Rule34', avatar: '' },
                link: `https://rule34.xxx/index.php?page=post&s=view&id=${item.id}`,
                source: 'Rule34.xxx'
            };
        }).filter(Boolean) as Pin[];
    } catch { return []; }
}

// RedGifs Direct Fetcher
async function fetchFromRedGifs(query?: string): Promise<Pin[]> {
    try {
        const qLower = query?.toLowerCase() || '';
        const isHentai = qLower === 'hentai' || qLower.includes('hentai');
        const search = isHentai ? 'hentai' : (query || 'hot');
        const url = `https://api.redgifs.com/v2/gifs/search?search_text=${encodeURIComponent(search)}&count=25&order=trending`;

        const data = await safeFetch(url);
        if (!data?.gifs) return [];

        return data.gifs.map((gif: any) => ({
            id: `rg-${gif.id}`,
            title: gif.userName || 'RedGifs Video',
            image: cleanUrl(gif.urls?.thumbnail || gif.urls?.poster || ''),
            video: cleanUrl(gif.urls?.sd || gif.urls?.hd || ''),
            height: gif.height || 360,
            width: gif.width || 640,
            type: 'video',
            user: { name: 'RedGifs', avatar: '' },
            link: `https://redgifs.com/watch/${gif.id}`,
            source: 'RedGifs'
        }));
    } catch { return []; }
}


// Realbooru API - Another massive database
async function fetchFromRealbooru(query?: string): Promise<Pin[]> {
    try {
        const qLower = query?.toLowerCase() || '';
        const isGeneric = !query || ['18+', 'nsfw', 'porn', 'hentai', 'all', 'adult', 'sex'].includes(qLower);
        const q = isGeneric ? 'rating:explicit' : query!.trim().replace(/ /g, '_');
        const url = `https://realbooru.com/index.php?page=dapi&s=post&q=index&json=1&limit=40&tags=${encodeURIComponent(q)}`;

        const data = await safeFetch(url);
        if (!Array.isArray(data)) return [];

        return data.map((item: any) => ({
            id: `real-${item.id}`,
            title: item.tags || 'Realbooru Content',
            image: cleanUrl(item.file_url),
            height: item.height || 800,
            width: item.width || 600,
            type: 'image',
            user: { name: 'Realbooru', avatar: '' },
            link: `https://realbooru.com/index.php?page=post&s=view&id=${item.id}`,
            source: 'Realbooru'
        } as Pin)).filter(p => p.image);
    } catch { return []; }
}

// TBIB API - The Big Image Board
async function fetchFromTbib(query?: string): Promise<Pin[]> {
    try {
        const qLower = query?.toLowerCase() || '';
        const isGeneric = !query || ['18+', 'nsfw', 'porn', 'hentai', 'all', 'adult', 'sex'].includes(qLower);
        const q = isGeneric ? 'rating:explicit' : query!.trim().replace(/ /g, '_');
        const url = `https://tbib.org/index.php?page=dapi&s=post&q=index&json=1&limit=40&tags=${encodeURIComponent(q)}`;

        const data = await safeFetch(url);
        if (!Array.isArray(data)) return [];

        return data.map((item: any) => ({
            id: `tbib-${item.id}`,
            title: item.tags || 'TBIB Content',
            image: cleanUrl(item.file_url),
            height: item.height || 800,
            width: item.width || 600,
            type: 'image',
            user: { name: 'TBIB', avatar: '' },
            link: `https://tbib.org/index.php?page=post&s=view&id=${item.id}`,
            source: 'TBIB'
        } as Pin)).filter(p => p.image);
    } catch { return []; }
}

// NSFW Content Fetcher - Hybrid "Feed + Search" System with Website APIs
async function fetchNSFWContent(query?: string): Promise<Pin[]> {
    try {
        const q = query?.toLowerCase() || 'nsfw';
        const isHentai = q === 'hentai' || q.includes('hentai');
        const isGeneric = !query || ['18+', 'nsfw', 'porn', 'sex', 'hentai', 'all', 'trending'].includes(q);

        console.log(`🔞 NSFW POWER FETCH: "${query || 'Generic 18+'}" (Hentai: ${isHentai})`);

        let imagesUrl = '';
        let videosUrl = '';

        // NUCLEAR PROXY: Diverse mirrors for Reddit
        const redditMirrors = [
            'https://n.reddit.com',
            'https://old.reddit.com',
            'https://reddit.one',
            'https://reddit.quest',
            'https://p.opnxng.com',
            'https://safer.reddit.com'
        ];
        const mirror = redditMirrors[Math.floor(Math.random() * redditMirrors.length)];
        const redditUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

        if (isGeneric) {
            const qType = query?.toLowerCase() || '18+';
            const over18 = 'include_over_18=on&raw_json=1&sort=hot';

            if (isHentai) {
                imagesUrl = `${mirror}/r/hentai+rule34+animehentai+HighResHentai/new.json?limit=100&${over18}`;
                videosUrl = `${mirror}/r/HentaiVideos+hentai_gifs+HENTAI_GIF/new.json?limit=100&${over18}`;
            } else {
                imagesUrl = `${mirror}/r/porn+RealGirls+legalteens+nsfw+gonewild/new.json?limit=100&${over18}`;
                videosUrl = `${mirror}/r/porn_gifs+nsfw_gifs+AdultGIFs+60fpsporn/new.json?limit=100&${over18}`;
            }
        } else {
            // Search specific term on Reddit NSFW subreddits
            const searchSub = isHentai ? 'hentai+rule34' : 'nsfw+porn';
            imagesUrl = `${mirror}/r/${searchSub}/search.json?q=${encodeURIComponent(query!)}&restrict_sr=on&limit=100&include_over_18=on&raw_json=1`;
        }

        // Fetch everything in parallel for maximum speed
        const results = await Promise.allSettled([
            safeFetch(imagesUrl, { headers: { 'User-Agent': redditUA } }),
            safeFetch(videosUrl, { headers: { 'User-Agent': redditUA } }),
            fetchFromRule34(query),
            fetchFromGelbooru(query),
            fetchFromRealbooru(query),
            fetchFromTbib(query),
            fetchFromPornhub(query),
            fetchFromYouPorn(query),
            fetchFromPornDotCom(query),
            fetchFromEporner(query),
            fetchFromXHamster(query),
            fetchFromSpankBang(query),
            fetchFromBeeg(query),
            fetchFromRedGifs(query),
            fetchFromDanbooru(query),
            fetchFromYandere(query),
            fetchFromKonachan(query),
            fetchFromGoogle(query || (isHentai ? 'hentai' : 'nsfw'), 'image', 0),
            fetchFromGoogle(query || (isHentai ? 'hentai' : 'nsfw'), 'video', 0)
        ]);

        const pins: Pin[] = [];
        results.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value) {
                if (Array.isArray(result.value)) {
                    pins.push(...result.value);
                }
            }
        });

        const usedIds = new Set(pins.map(p => p.id));

        // Process Reddit results specifically if they succeeded
        const processReddit = (res: any, type: 'image' | 'video') => {
            if (!res?.data?.children) return;
            res.data.children.forEach((child: any) => {
                const p = child.data;
                if (!p?.url || usedIds.has(p.id)) return;

                const isImage = p.url.match(/\.(jpg|jpeg|png|webp|gif)$/i) || p.post_hint === 'image';
                const isVideo = p.is_video || p.post_hint === 'hosted:video' || p.url.includes('.gif') ||
                    p.domain.includes('redgifs') || p.url.includes('.mp4') || p.url.includes('v.redd.it');

                if (type === 'image' && isImage) {
                    usedIds.add(p.id);
                    pins.push({
                        id: `nsfw-img-${p.id}`,
                        title: p.title,
                        image: p.url.includes('imgur.com') && !p.url.match(/\.(jpg|jpeg|png|gif)$/) ? p.url + '.jpg' : p.url,
                        height: p.preview?.images?.[0]?.source?.height || 800,
                        width: p.preview?.images?.[0]?.source?.width || 600,
                        type: 'image',
                        user: { name: p.subreddit_name_prefixed || p.author, avatar: '' },
                        link: `https://reddit.com${p.permalink}`,
                        source: 'Reddit'
                    });
                } else if (type === 'video' && isVideo) {
                    let videoUrl = p.preview?.reddit_video_preview?.fallback_url ||
                        p.media?.reddit_video?.fallback_url ||
                        p.preview?.images?.[0]?.variants?.mp4?.source?.url;

                    if (!videoUrl && p.domain.includes('redgifs')) {
                        const id = p.url.split('/').pop();
                        videoUrl = `https://v3.redgifs.com/watch/${id}`;
                    }

                    if (videoUrl || p.url.includes('.mp4')) {
                        usedIds.add(p.id);
                        pins.push({
                            id: `nsfw-vid-${p.id}`,
                            title: p.title,
                            image: cleanUrl(p.preview?.images?.[0]?.source?.url || p.thumbnail || ''),
                            video: cleanUrl(videoUrl || p.url).split('?')[0],
                            height: p.preview?.images?.[0]?.source?.height || 800,
                            width: p.preview?.images?.[0]?.source?.width || 600,
                            type: 'video',
                            user: { name: p.subreddit_name_prefixed || p.author, avatar: '' },
                            link: `https://reddit.com${p.permalink}`,
                            source: 'Reddit'
                        });
                    }
                }
            });
        };

        const redditImages = results[0].status === 'fulfilled' ? results[0].value : null;
        const redditVideos = results[1].status === 'fulfilled' ? results[1].value : null;

        processReddit(redditImages, 'image');
        processReddit(redditVideos, 'video');

        console.log(`🔞 Found ${pins.length} NSFW items.`);

        // EMERGENCY FALLBACK: If everything failed, try a very broad search
        if (pins.length < 5) {
            console.log('🚨 NSFW Low Results Fallback');
            const fallback = await fetchFromRule34(isHentai ? 'hentai' : 'rating:explicit');
            if (fallback.length > 0) pins.push(...fallback);
        }

        return pins
            .filter(p => p && p.image)
            .sort(() => Math.random() - 0.5);

    } catch (e) {
        console.error('NSFW fetch error:', e);
        return [];
    }
}


// Main GET endpoint - COMPREHENSIVE search
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q')?.trim();

        console.log(`🔍 COMPREHENSIVE SEARCH: "${q || 'trending'}"`);

        // Determine what to fetch
        const query = q?.toLowerCase() || '';
        const isAnimalSearch = query.match(/dog|puppy|cat|kitten|pet|animal/);
        const isVideoSearch = query === 'videos' || query.includes('video');
        const isNSFWSearch = ['18+', 'porn', 'hentai', 'nsfw', 'sex', 'x', 'adult'].includes(query) ||
            query.includes('porn') || query.includes('hentai') || query.includes('18+') || query.includes('nsfw') || query.includes('adult');

        // Fetch from ALL sources in parallel
        // If it's a dedicated NSFW search, prioritize adult sources.
        // Otherwise, fetch from everything but keep safe search on for the standard ones.
        const allResults = await Promise.allSettled([
            // Always fetch NSFW content if keywords match or even slightly match
            (isNSFWSearch || query.length > 3) ? fetchNSFWContent(q || '18+') : Promise.resolve([]),

            // Standard content
            fetchFromYouTube(q),
            fetchFromGoogle(q, 'image', isNSFWSearch ? 0 : 1),
            fetchFromGoogle(q, 'video', isNSFWSearch ? 0 : 1),
            fetchFromPexels(q, 'photos'),
            fetchFromPixabay(q),
            fetchFromReddit(q, 'image'),
            fetchFromReddit(q, 'video'),
            fetchFromGiphy(q),
            fetchFromPexels(q, 'videos'),

            // NASA / Animals (Conditional)
            query.match(/space|nasa|galaxy|planet|star|universe/) ? fetchFromNASA() : Promise.resolve([]),
            isAnimalSearch && query.match(/dog|puppy/) ? fetchAnimals('dog', 10) : Promise.resolve([]),
            isAnimalSearch && query.match(/cat|kitten/) ? fetchAnimals('cat', 10) : Promise.resolve([]),

            fetchFromPicsum(10)
        ]);

        // Combine all successful results
        const allPins: Pin[] = allResults
            .filter((result): result is PromiseFulfilledResult<Pin[]> => result.status === 'fulfilled')
            .flatMap(result => result.value)
            .filter(pin => pin && pin.id && pin.image);

        console.log(`📦 Collected ${allPins.length} pins from all sources`);

        // Deduplicate by ID
        const uniquePins = Array.from(new Map(allPins.map(p => [p.id, p])).values());

        // Sort strategically
        if (isVideoSearch) {
            uniquePins.sort((a, b) => {
                if (a.type === 'video' && b.type !== 'video') return -1;
                if (a.type !== 'video' && b.type === 'video') return 1;
                return Math.random() - 0.5;
            });
        } else {
            // Mix images and videos for variety
            uniquePins.sort(() => Math.random() - 0.5);
        }

        // Take top 120 results
        const finalPins = uniquePins.slice(0, 120);

        const imageCount = finalPins.filter(p => p.type === 'image').length;
        const videoCount = finalPins.filter(p => p.type === 'video').length;

        console.log(`✅ RETURNING ${finalPins.length} pins (${imageCount} images, ${videoCount} videos)`);

        return NextResponse.json(finalPins);

    } catch (error: any) {
        console.error('❌ API ERROR:', error.message);

        // Always return something - fallback to Picsum
        const fallback = await fetchFromPicsum(25);
        return NextResponse.json(fallback);
    }
}
