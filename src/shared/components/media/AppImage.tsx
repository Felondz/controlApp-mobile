import React from 'react';
import { StyleSheet } from 'react-native';
import { Image as ExpoImage } from 'expo-image';

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
}: AppImageProps) {
    return (
        <ExpoImage
            source={source}
            style={[styles.image, style]}
            className={className}
            contentFit={contentFit}
            transition={transition}
            placeholder={placeholder ? { blurhash: placeholder } : undefined}
            priority={priority}
            recyclingKey={recyclingKey}
            accessibilityLabel={alt}
        />
    );
}

const styles = StyleSheet.create({
    image: {
        width: '100%',
        height: '100%',
    },
});
