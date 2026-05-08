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

    // New Secure Project Image Route: /api/projects/{uuid}/image
    // Check if the path is a UUID (approximate check)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(path);
    if (isUuid) {
        return `${apiUrl}/proyectos/${path}/image`;
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

