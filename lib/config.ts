// Free API Configuration
// Add your API keys here (optional - app works without them)

export const API_CONFIG = {
    // Unsplash (https://unsplash.com/developers)
    // Free tier: 50 requests/hour
    UNSPLASH_ACCESS_KEY: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || '',

    // Pexels (https://www.pexels.com/api/)
    // Free tier: 200 requests/hour
    PEXELS_API_KEY: process.env.NEXT_PUBLIC_PEXELS_API_KEY || '',

    // Pixabay (https://pixabay.com/api/docs/)
    // Free tier: 5000 requests/hour
    PIXABAY_API_KEY: process.env.NEXT_PUBLIC_PIXABAY_API_KEY || '',

    // Giphy (https://developers.giphy.com/)
    // Free tier: 42 requests/hour (or use public beta key)
    GIPHY_API_KEY: process.env.NEXT_PUBLIC_GIPHY_API_KEY || 'dc6zaTOxFJmzC', // Public beta key
};

// Check which APIs are enabled
export const enabledAPIs = {
    unsplash: !!API_CONFIG.UNSPLASH_ACCESS_KEY,
    pexels: !!API_CONFIG.PEXELS_API_KEY,
    pixabay: !!API_CONFIG.PIXABAY_API_KEY,
    giphy: !!API_CONFIG.GIPHY_API_KEY,
    reddit: true, // Always available
    flickr: true, // Always available
    nasa: true, // No key required
    picsum: true, // No key required
    dogs: true, // No key required
    cats: true, // No key required
};
