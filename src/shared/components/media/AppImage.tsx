import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Image as ExpoImage, ImageProps as ExpoImageProps } from 'expo-image';
import { useAuthStore } from '../../../stores/authStore';

interface AppImageProps {
    source: { uri: string } | number;
    style?: object;
    className?: string;
    contentFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
    transition?: number;
    placeholder?: string;
    priority?: 'low' | 'normal' | 'high';
    recyclingKey?: string;
    alt?: string;
    cachePolicy?: ExpoImageProps['cachePolicy'];
}

export function AppImage({
    source,
    style,
    className,
    contentFit = 'cover',
    transition = 200,
    placeholder,
    priority = 'normal',
    recyclingKey,
    alt,
    cachePolicy = 'memory-disk',
}: AppImageProps) {
    const { token } = useAuthStore();

    const authenticatedSource = useMemo(() => {
        if (typeof source === 'number' || !source?.uri) {
            return source;
        }
        
        // Only attach headers to remote HTTP/HTTPS URLs
        if (source.uri.startsWith('http://') || source.uri.startsWith('https://')) {
            return {
                uri: source.uri,
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    Accept: 'image/*',
                }
            };
        }

        return source;
    }, [source, token]);

    return (
        <ExpoImage
            source={authenticatedSource}
            style={[styles.image, style]}
            className={className}
            contentFit={contentFit}
            transition={transition}
            placeholder={placeholder ? { blurhash: placeholder } : undefined}
            priority={priority}
            recyclingKey={recyclingKey}
            accessibilityLabel={alt}
            cachePolicy={cachePolicy}
            onError={(e) => {
                const uri = typeof authenticatedSource === 'object' && 'uri' in authenticatedSource ? authenticatedSource.uri : 'unknown';
                console.warn(`[AppImage] Failed to load: ${uri}`, e);
            }}
        />
    );
}

const styles = StyleSheet.create({
    image: {
        width: '100%',
        height: '100%',
    },
});
