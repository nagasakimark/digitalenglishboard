export const getTikTokVideoId = (url) => {
    if (!url) return null;

    // Handle different TikTok URL formats
    const patterns = [
        /tiktok\.com\/@[\w.-]+\/video\/(\d+)/, // Standard web URL
        /tiktok\.com\/v\/(\d+)/, // Old/Mobile URL
        /^(\d+)$/ // Direct video ID
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    return null;
};
