/**
 * Utility to resolve image URLs from the backend
 */
export const resolveImageUrl = (path?: string | null): string | null => {
    if (!path) return null;
    
    // If it's already an absolute URL or a local URI, return as is
    if (
        path.startsWith('http') || 
        path.startsWith('file://') || 
        path.startsWith('content://') || 
        path.startsWith('data:')
    ) {
        return path;
    }

    let apiUrl = process.env.EXPO_PUBLIC_API_URL || '';
    
    // Remove trailing slash from API URL if exists
    if (apiUrl.endsWith('/')) {
        apiUrl = apiUrl.slice(0, -1);
    }

    const baseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;

    // If it starts with /, it's an absolute path from server root (e.g. /storage/...)
    if (path.startsWith('/')) {
        return `${baseUrl}${path}`;
    }
    
    // If it starts with storage/, it needs the base URL
    if (path.startsWith('storage/')) {
        return `${baseUrl}/${path}`;
    }

    // Otherwise, assume it's a relative storage path (e.g. profiles/abc.jpg)
    return `${baseUrl}/storage/${path}`;
};
