/**
 * Image optimization utilities for better loading performance
 */

// Image cache to prevent duplicate loads
const imageCache: Record<string, string> = {};

/**
 * Preloads an image and returns a promise that resolves when loading is complete
 * @param src Image source URL
 * @returns Promise that resolves with the image source when loaded
 */
export const preloadImage = (src: string): Promise<string> => {
  // Return cached image if available
  if (imageCache[src]) {
    return Promise.resolve(imageCache[src]);
  }
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      // Cache the loaded image
      imageCache[src] = src;
      resolve(src);
    };
    
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${src}`));
    };
    
    img.src = src;
  });
};

/**
 * Preloads multiple images in parallel
 * @param sources Array of image source URLs
 * @returns Promise that resolves when all images are loaded
 */
export const preloadImages = (sources: string[]): Promise<string[]> => {
  return Promise.all(sources.map(src => preloadImage(src)));
};

/**
 * Returns a low-quality image placeholder URL for a TMDB image
 * @param path TMDB image path or full URL
 * @returns Low quality placeholder URL
 */
export const getLowQualityPlaceholder = (path: string | undefined | null): string => {
  if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
  
  // For TMDB URLs, switch to lower quality
  if (path.includes('image.tmdb.org')) {
    if (path.includes('/original/')) {
      return path.replace('/original/', '/w200/');
    }
    if (path.includes('/w500/')) {
      return path.replace('/w500/', '/w92/');
    }
  }
  
  // Return the original for other URLs
  return path;
};

/**
 * Intersection Observer API wrapper for lazy loading images
 */
class LazyImageLoader {
  private observer: IntersectionObserver;
  private observedElements: Map<Element, string> = new Map();
  
  constructor() {
    this.observer = new IntersectionObserver(this.onIntersection.bind(this), {
      rootMargin: '200px 0px', // Load images 200px before they come into view
      threshold: 0.01 // Trigger when at least 1% of the element is visible
    });
  }
  
  /**
   * Handle intersection observer callbacks
   */
  private onIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const originalSrc = this.observedElements.get(element);
        
        if (originalSrc && element instanceof HTMLImageElement) {
          // Start loading the high-quality image
          preloadImage(originalSrc)
            .then(() => {
              element.src = originalSrc;
              element.classList.add('loaded');
            })
            .catch(() => {
              console.error('Failed to load image:', originalSrc);
            });
          
          // Stop observing this element
          this.observer.unobserve(element);
          this.observedElements.delete(element);
        }
      }
    });
  }
  
  /**
   * Observe an image element for lazy loading
   * @param element Image element to observe
   * @param src Final high-quality image source
   * @param placeholder Low-quality placeholder to show initially
   */
  public observe(element: HTMLImageElement, src: string, placeholder?: string): void {
    if (!src) return;
    
    // Store the original source for later
    this.observedElements.set(element, src);
    
    // Set initial low-quality placeholder
    if (placeholder) {
      element.src = placeholder;
    } else {
      element.src = getLowQualityPlaceholder(src);
    }
    
    // Add loading class for transitions
    element.classList.add('loading');
    
    // Start observing
    this.observer.observe(element);
  }
  
  /**
   * Stop observing all elements
   */
  public disconnect(): void {
    this.observer.disconnect();
    this.observedElements.clear();
  }
}

// Export a singleton instance
export const lazyImageLoader = new LazyImageLoader();

// React hook to use with image components
export const useLazyImage = () => {
  return {
    registerImage: (element: HTMLImageElement | null, src: string, placeholder?: string) => {
      if (element && src) {
        lazyImageLoader.observe(element, src, placeholder);
      }
    }
  };
};

export default {
  preloadImage,
  preloadImages,
  getLowQualityPlaceholder,
  lazyImageLoader,
  useLazyImage
}; 