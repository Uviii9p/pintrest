export interface Pin {
    id: string;
    title: string;
    image: string; // Thumbnail for video
    video?: string; // Video URL if type is video
    type: 'image' | 'video';
    height: number; // Aspect ratio height (relative) or actual pixel height
    width: number;
    user: {
        name: string;
        avatar: string;
    };
    link?: string;
    source?: string;
}
