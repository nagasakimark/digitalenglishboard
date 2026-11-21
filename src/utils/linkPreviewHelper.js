// Helper functions for link preview generation

export const extractVideoId = (url) => {
  // YouTube video ID extraction
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(youtubeRegex);
  return match ? match[1] : null;
};

export const getYouTubeThumbnail = (videoId) => {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

// Helper to convert image URL to data URL
const imageUrlToDataUrl = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Failed to convert image to data URL:', error);
    return imageUrl; // Return original URL if conversion fails
  }
};

export const generateLinkPreview = async (url) => {
  try {
    // Check if it's a YouTube video
    const videoId = extractVideoId(url);
    if (videoId) {
      // Try to get video title from YouTube API (basic approach)
      try {
        const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
        if (response.ok) {
          const data = await response.json();
          const thumbnailUrl = getYouTubeThumbnail(videoId);
          // Convert thumbnail to data URL
          const dataUrl = await imageUrlToDataUrl(thumbnailUrl);
          
          return {
            title: data.title || 'YouTube Video',
            description: `By ${data.author_name || 'Unknown'} - Click to watch this video`,
            imageUrl: dataUrl,
            siteName: 'YouTube',
            type: 'video'
          };
        }
      } catch (e) {
        // Fallback if YouTube API fails
      }
      
      const thumbnailUrl = getYouTubeThumbnail(videoId);
      const dataUrl = await imageUrlToDataUrl(thumbnailUrl);
      
      return {
        title: 'YouTube Video',
        description: 'Click to watch this video',
        imageUrl: dataUrl,
        siteName: 'YouTube',
        type: 'video'
      };
    }

    // For other websites, try to extract some basic info
    const domain = new URL(url).hostname.replace('www.', '');
    
    // Create a more descriptive title based on domain
    let title = domain;
    if (domain.includes('wikipedia')) {
      title = 'Wikipedia Article';
    } else if (domain.includes('github')) {
      title = 'GitHub Repository';
    } else if (domain.includes('stackoverflow')) {
      title = 'Stack Overflow Question';
    } else if (domain.includes('reddit')) {
      title = 'Reddit Post';
    } else {
      // Capitalize domain name
      title = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
    }

    // Convert favicon to data URL
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    const faviconDataUrl = await imageUrlToDataUrl(faviconUrl);

    return {
      title: title,
      description: `Visit ${domain} for more information`,
      imageUrl: faviconDataUrl,
      siteName: domain,
      type: 'link'
    };
  } catch (error) {
    console.error('Error generating link preview:', error);
    return {
      title: 'External Link',
      description: 'Click to visit this website',
      siteName: 'External Link',
      type: 'link'
    };
  }
};

export const getDomainFromUrl = (url) => {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return 'Link';
  }
};