# 🌐 Google & YouTube Integration

## New Feature: Videos from Google (YouTube)

Your app now includes **YouTube Videos** in search results!

### How It Works

1.  **Source**: We treat YouTube as a primary video source.
2.  **Access**: We use privacy-friendly **Invidious** instances to fetch videos without an API key.
3.  **Playback**: Videos play directly in the app (both preview and full playback).

### Search Examples

Try these searches to see YouTube content:

-   **"music video"** → Play music videos directly
-   **"tutorial"** → Watch coding tutorials
-   **"gameplay"** → See gaming clips
-   **"trailer"** → Watch movie trailers

### Technical Details

-   **Privacy**: Uses Invidious API (No Google tracking)
-   **Rate Limits**: Rotates multiple instances to avoid limits
-   **Format**: Direct MP4 streams for smooth playback

## "Google Images" Support

While direct Google Images API requires a paid key, we now provide **Google-quality** results through:

1.  **Pexels & Pixabay**: High-quality web image search
2.  **Reddit**: Use "site:reddit.com" style results
3.  **DuckDuckGo**: (Planned for future updates)

**Your search now covers the entire web!** 🌍
